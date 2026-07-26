import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type MealType = 'breakfast' | 'lunch' | 'dinner'

type RequestBody = {
  familyId?: string
  mealType?: MealType
  priorities?: string[]
  excludeMealIds?: string[]
  feedback?: string
}

type MealRow = {
  id: string
  slug: string | null
  type: MealType
  title: string
  summary: string | null
  side_dishes: string[]
  image_path: string | null
  image_url: string | null
  cooking_time_minutes: number
  estimated_cost: number
  servings: number
  missing_ingredients: string[]
  tags: string[]
  cuisine: string | null
  difficulty: string | null
  nutrition: Record<string, unknown>
}

type FamilyRow = {
  name: string
  location: string | null
  adults: number
  children: number
  budget_level: string
  cooking_time_preference: string
}

type HistoryRow = {
  meal_id: string
  action: string
  reason: string | null
  created_at?: string
}

type RankedMeal = {
  meal: MealRow
  score: number
}

type AiSelection = {
  orderedMealIds: string[]
  reasons: string[]
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizePriorities(priorities: unknown): string[] {
  if (!Array.isArray(priorities)) return []

  return priorities
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6)
}

function scoreMeal(meal: MealRow, priorities: string[], history: HistoryRow[]): number {
  let score = 50
  const tags = meal.tags.map((tag) => tag.toLowerCase())

  if (priorities.includes('quick') || priorities.includes('nhanh gọn') || priorities.includes('nhanh')) {
    score += Math.max(0, 35 - meal.cooking_time_minutes)
  }
  if (priorities.includes('budget') || priorities.includes('tiết kiệm')) {
    score += Math.max(0, Math.round((180_000 - meal.estimated_cost) / 10_000))
  }
  if (priorities.includes('healthy') || priorities.includes('lành mạnh') || priorities.includes('sức khỏe')) {
    score += tags.some((tag) => ['healthy', 'vegetable', 'light'].includes(tag)) ? 18 : 0
  }
  if (priorities.includes('kid-friendly') || priorities.includes('trẻ em') || priorities.includes('dễ ăn')) {
    score += tags.some((tag) => ['family', 'kid-friendly', 'mild'].includes(tag)) ? 18 : 0
  }

  const mealHistory = history.filter((item) => item.meal_id === meal.id).slice(0, 8)
  for (const item of mealHistory) {
    if (item.action === 'rejected') score -= 35
    if (item.action === 'selected') score += 8
    if (item.action === 'completed') score += 14
  }
  if (history.slice(0, 4).some((item) => item.meal_id === meal.id && item.action === 'completed')) {
    score -= 30
  }

  return score
}

function rankMeals(meals: MealRow[], priorities: string[], history: HistoryRow[]): RankedMeal[] {
  return meals
    .map((meal) => ({ meal, score: scoreMeal(meal, priorities, history) }))
    .sort((left, right) => right.score - left.score || left.meal.title.localeCompare(right.meal.title))
}

function buildRuleReasons(primary: MealRow, priorities: string[]): string[] {
  const reasons: string[] = []

  if (primary.cooking_time_minutes <= 30) reasons.push(`Hoàn thành trong khoảng ${primary.cooking_time_minutes} phút`)
  if (primary.estimated_cost <= 160_000) reasons.push('Chi phí phù hợp với bữa ăn gia đình')
  if (priorities.length > 0) reasons.push(`Phù hợp ưu tiên: ${priorities.slice(0, 2).join(', ')}`)
  if (primary.tags.includes('family')) reasons.push('Hương vị dễ ăn cho cả gia đình')

  while (reasons.length < 3) {
    reasons.push([
      'Nguyên liệu quen thuộc và dễ chuẩn bị',
      'Cân bằng giữa món chính và rau ăn kèm',
      'Phù hợp để dùng trong thực đơn hằng ngày',
    ][reasons.length])
  }

  return reasons.slice(0, 3)
}

function extractOutputText(payload: Record<string, unknown>): string | null {
  if (typeof payload.output_text === 'string') return payload.output_text
  if (!Array.isArray(payload.output)) return null

  for (const item of payload.output) {
    if (!item || typeof item !== 'object') continue
    const content = (item as { content?: unknown }).content
    if (!Array.isArray(content)) continue

    for (const part of content) {
      if (
        part &&
        typeof part === 'object' &&
        (part as { type?: unknown }).type === 'output_text' &&
        typeof (part as { text?: unknown }).text === 'string'
      ) {
        return (part as { text: string }).text
      }
    }
  }

  return null
}

function validateAiSelection(value: unknown, allowedIds: Set<string>): AiSelection | null {
  if (!value || typeof value !== 'object') return null

  const orderedMealIds = (value as { orderedMealIds?: unknown }).orderedMealIds
  const reasons = (value as { reasons?: unknown }).reasons

  if (
    !Array.isArray(orderedMealIds) ||
    orderedMealIds.length !== 3 ||
    !orderedMealIds.every((id) => typeof id === 'string' && allowedIds.has(id)) ||
    new Set(orderedMealIds).size !== 3
  ) {
    return null
  }

  if (
    !Array.isArray(reasons) ||
    reasons.length !== 3 ||
    !reasons.every((reason) => typeof reason === 'string' && reason.trim().length > 0 && reason.length <= 180)
  ) {
    return null
  }

  return {
    orderedMealIds,
    reasons: reasons.map((reason) => reason.trim()),
  }
}

async function safetyIdentifier(userId: string): Promise<string> {
  const bytes = new TextEncoder().encode(userId)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

async function selectWithOpenAi(args: {
  model: string
  apiKey: string
  family: FamilyRow
  mealType: MealType
  priorities: string[]
  feedback: string | null
  candidates: MealRow[]
  history: HistoryRow[]
  userId: string
}): Promise<AiSelection> {
  const allowedIds = args.candidates.map((meal) => meal.id)
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      orderedMealIds: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: { type: 'string', enum: allowedIds },
      },
      reasons: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: { type: 'string' },
      },
    },
    required: ['orderedMealIds', 'reasons'],
  }

  const context = {
    family: {
      location: args.family.location,
      adults: args.family.adults,
      children: args.family.children,
      budgetLevel: args.family.budget_level,
      cookingTimePreference: args.family.cooking_time_preference,
    },
    mealType: args.mealType,
    priorities: args.priorities,
    feedback: args.feedback,
    recentHistory: args.history,
    candidates: args.candidates.map((meal) => ({
      id: meal.id,
      title: meal.title,
      sideDishes: meal.side_dishes,
      cookingTimeMinutes: meal.cooking_time_minutes,
      estimatedCost: meal.estimated_cost,
      servings: meal.servings,
      missingIngredients: meal.missing_ingredients,
      tags: meal.tags,
    })),
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({
      model: args.model,
      store: false,
      reasoning: { effort: 'low' },
      max_output_tokens: 700,
      safety_identifier: await safetyIdentifier(args.userId),
      input: [
        {
          role: 'developer',
          content: [
            {
              type: 'input_text',
              text:
                'Bạn là trợ lý chọn món cho gia đình Việt Nam. Chỉ chọn đúng 3 meal ID có trong danh sách ứng viên, xếp món phù hợp nhất trước. Ba lý do ngắn gọn phải giải thích món đầu tiên dựa trên dữ liệu được cung cấp. Không chẩn đoán y khoa, không tự bịa nguyên liệu hay meal ID.',
            },
          ],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: JSON.stringify(context) }],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'meal_recommendation',
          strict: true,
          schema,
        },
      },
    }),
  })

  const payload = (await response.json()) as Record<string, unknown>
  if (!response.ok) {
    const message =
      payload.error && typeof payload.error === 'object'
        ? String((payload.error as { message?: unknown }).message ?? 'OpenAI request failed')
        : 'OpenAI request failed'
    throw new Error(message)
  }

  const outputText = extractOutputText(payload)
  if (!outputText) throw new Error('OpenAI response did not contain structured output')

  let parsed: unknown
  try {
    parsed = JSON.parse(outputText)
  } catch {
    throw new Error('OpenAI response was not valid JSON')
  }

  const selection = validateAiSelection(parsed, new Set(allowedIds))
  if (!selection) throw new Error('OpenAI response failed recommendation validation')
  return selection
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: 'Server configuration is missing' }, 500)
  }

  const authorization = request.headers.get('Authorization')
  if (!authorization) {
    return jsonResponse({ error: 'Missing authorization header' }, 401)
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const familyId = body.familyId?.trim()
  const mealType = body.mealType
  const priorities = normalizePriorities(body.priorities)
  const excludeMealIds = Array.isArray(body.excludeMealIds)
    ? body.excludeMealIds.filter((id): id is string => typeof id === 'string').slice(0, 20)
    : []
  const feedback =
    typeof body.feedback === 'string' && body.feedback.trim()
      ? body.feedback.trim().slice(0, 240)
      : null

  if (!familyId || !mealType || !['breakfast', 'lunch', 'dinner'].includes(mealType)) {
    return jsonResponse({ error: 'familyId and a valid mealType are required' }, 400)
  }

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  })

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser()

  if (userError || !user) {
    return jsonResponse({ error: 'Invalid session' }, 401)
  }

  const { data: membership, error: membershipError } = await client
    .from('family_members')
    .select('id')
    .eq('family_id', familyId)
    .eq('account_id', user.id)
    .maybeSingle()

  if (membershipError || !membership) {
    return jsonResponse({ error: 'Family membership is required' }, 403)
  }

  const [{ data: family, error: familyError }, { data: history, error: historyError }] =
    await Promise.all([
      client
        .from('families')
        .select('name, location, adults, children, budget_level, cooking_time_preference')
        .eq('id', familyId)
        .single(),
      client
        .from('recommendation_history')
        .select('meal_id, action, reason, created_at')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

  if (familyError || !family) {
    return jsonResponse({ error: 'Family profile could not be loaded' }, 500)
  }
  if (historyError) {
    return jsonResponse({ error: 'Recommendation history could not be loaded' }, 500)
  }

  let mealQuery = client
    .from('meals')
    .select('id, slug, type, title, summary, side_dishes, image_path, image_url, cooking_time_minutes, estimated_cost, servings, missing_ingredients, tags, cuisine, difficulty, nutrition')
    .eq('type', mealType)
    .eq('active', true)
    .eq('content_status', 'published')
    .order('popularity_score', { ascending: false })
    .order('id', { ascending: true })
    .limit(30)

  if (excludeMealIds.length > 0) {
    mealQuery = mealQuery.not('id', 'in', `(${excludeMealIds.map((id) => `"${id.replaceAll('"', '')}"`).join(',')})`)
  }

  const { data: meals, error: mealsError } = await mealQuery
  if (mealsError) {
    return jsonResponse({ error: 'Meals could not be loaded' }, 500)
  }
  if (!meals || meals.length < 3) {
    return jsonResponse({ error: 'Not enough meals are available' }, 404)
  }

  const ranked = rankMeals(meals as MealRow[], priorities, (history ?? []) as HistoryRow[])
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-5.4-mini'
  let selected = ranked.slice(0, 3).map(({ meal }) => meal)
  let reasons = buildRuleReasons(selected[0], priorities)
  let source: 'openai' | 'rules' = 'rules'

  if (apiKey) {
    try {
      const aiSelection = await selectWithOpenAi({
        model,
        apiKey,
        family: family as FamilyRow,
        mealType,
        priorities,
        feedback,
        candidates: ranked.map(({ meal }) => meal),
        history: (history ?? []) as HistoryRow[],
        userId: user.id,
      })
      const byId = new Map(ranked.map(({ meal }) => [meal.id, meal]))
      selected = aiSelection.orderedMealIds.map((id) => byId.get(id) as MealRow)
      reasons = aiSelection.reasons
      source = 'openai'
    } catch (error) {
      console.warn('OpenAI recommendation failed; using deterministic ranking', {
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const primary = selected[0]
  const scoreById = new Map(ranked.map(({ meal, score }) => [meal.id, score]))
  const { data: recommendation, error: insertError } = await client
    .from('recommendations')
    .insert({
      family_id: familyId,
      meal_type: mealType,
      priorities,
      primary_meal_id: primary.id,
      alternative_meal_ids: selected.slice(1).map((meal) => meal.id),
      reasons,
      score_metadata: {
        source,
        model: source === 'openai' ? model : null,
        scores: Object.fromEntries(selected.map((meal) => [meal.id, scoreById.get(meal.id)])),
      },
    })
    .select('id')
    .single()

  if (insertError || !recommendation) {
    return jsonResponse({ error: 'Recommendation could not be saved' }, 500)
  }

  return jsonResponse({
    recommendationId: recommendation.id,
    primary,
    alternatives: selected.slice(1),
    reasons,
    source,
    model: source === 'openai' ? model : null,
  })
})
