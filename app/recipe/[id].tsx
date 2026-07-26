import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import {useState} from 'react';
import {ActivityIndicator,Image,Pressable,ScrollView,Share,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {persistFavorite,persistShoppingSnapshot} from '../../src/cloud-sync';
import {Button,IconButton} from '../../src/components';
import {getCachedMeal} from '../../src/catalog';
import {meals} from '../../src/data';
import {nutritionForMeal} from '../../src/nutrition';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';
import {NutritionInfo,RecipeIngredient,RecipeStep} from '../../src/types';
import {useRecipe} from '../../src/use-recipe';
import {useMeal} from '../../src/use-catalog';

type Tab='ingredients'|'steps'|'nutrition'|'replace';

export default function Recipe(){
 const {id}=useLocalSearchParams<{id:string}>(),mealId=id??meals[0].id,{width}=useWindowDimensions(),tablet=width>=768;
 const meal=useMeal(mealId)??getCachedMeal(mealId)??meals[0],{recipe,source,loading}=useRecipe(mealId);
 const add=useAppStore(state=>state.addMissing),availability=useAppStore(state=>state.ingredientAvailability),toggleAvailability=useAppStore(state=>state.toggleIngredientAvailability),familyId=useAppStore(state=>state.family?.id),[tab,setTab]=useState<Tab>('ingredients');
 const favorite=useAppStore(state=>state.favoriteMealIds.includes(mealId)),toggleFavorite=useAppStore(state=>state.toggleFavorite);
 const ingredients=recipe.ingredients.map(item=>({...item,available:availability[item.id]??false}));
 const missingCount=ingredients.filter(item=>!item.available&&!item.optional).length;
 const nutrition=nutritionForMeal(meal);
 const addToShopping=()=>{add(ingredients);void persistShoppingSnapshot(familyId).catch(()=>undefined);router.push('/tabs/shopping')};
 const favoriteMeal=()=>{const next=!favorite;toggleFavorite(mealId);void persistFavorite(mealId,next).catch(()=>toggleFavorite(mealId))};
 const shareRecipe=()=>void Share.share({title:meal.title,message:`${meal.title}\n${meal.cookingTimeMinutes} phút · ${meal.servings} người\ndailymeals://recipe/${mealId}`});
 return <SafeAreaView style={x.safe}>
  <View style={x.header}>
   <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" style={x.back} onPress={()=>router.back()}><Ionicons name="arrow-back" size={23}/></Pressable>
   <Text style={x.headerTitle} numberOfLines={1}>{meal.title}</Text>
   <View style={x.headerIcons}><IconButton accessibilityLabel={favorite?'Bỏ khỏi yêu thích':'Thêm vào yêu thích'} name={favorite?'heart':'heart-outline'} onPress={favoriteMeal}/><IconButton accessibilityLabel="Chia sẻ công thức" name="share-social-outline" onPress={shareRecipe}/></View>
  </View>
  <ScrollView contentContainerStyle={x.page}>
   <View style={[x.layout,tablet&&x.layoutTablet]}>
    <View style={x.left}>
     <View style={x.metaCard}><Text style={x.title}>{meal.title}</Text><View style={x.meta}><Text>⭐ 4.8</Text><Text>◷ {meal.cookingTimeMinutes} phút</Text><Text>♙ {meal.servings} người</Text><Text>💰 ~{meal.estimatedCost.toLocaleString('vi-VN')}đ</Text></View></View>
     {loading?<View accessibilityLiveRegion="polite" style={x.recipeStatus}><ActivityIndicator size="small" color={colors.primary}/><Text style={x.statusText}>Đang cập nhật công thức…</Text></View>:source!=='cloud'?<View accessibilityLiveRegion="polite" style={x.recipeStatus}><Ionicons name="cloud-offline-outline" size={18} color={colors.secondary}/><Text style={x.statusText}>Đang dùng công thức lưu trên thiết bị.</Text></View>:null}
     {!tablet&&<Image source={meal.image} style={x.hero}/>}
     <View accessibilityRole="tablist" style={x.tabs}>{([['ingredients','Nguyên liệu'],['steps','Cách nấu'],['nutrition','Dinh dưỡng'],['replace','Gợi ý']] as const).map(([key,label])=><Pressable accessibilityRole="tab" accessibilityState={{selected:tab===key}} key={key} onPress={()=>setTab(key)} style={[x.tab,tab===key&&x.tabActive]}><Text numberOfLines={1} style={[x.tabText,tab===key&&x.tabTextActive]}>{label}</Text></Pressable>)}</View>
     {tab==='ingredients'?<View style={x.list}><Text style={x.listTitle}>Nguyên liệu ({ingredients.length})</Text><Text style={x.ingredientHint}>Đánh dấu những nguyên liệu bạn đang có.</Text>{ingredients.map(item=><Pressable key={item.id} onPress={()=>toggleAvailability(item.id)} style={[x.item,item.available&&x.itemAvailable]} accessibilityRole="checkbox" accessibilityLabel={`${item.name}, ${item.quantity}`} accessibilityState={{checked:item.available}}><View style={x.ingredientCopy}><Text style={item.available&&x.availableText}>{item.available?'☑':'☐'}　{item.name}{item.optional?' (tùy chọn)':''}</Text>{item.preparation?<Text style={x.preparation}>{item.preparation}</Text>:null}</View><Text style={item.available&&x.availableText}>{item.quantity}</Text></Pressable>)}</View>:tab==='steps'?<Steps steps={recipe.steps}/>:tab==='nutrition'?<Nutrition nutrition={nutrition}/>:<Substitutions ingredients={ingredients}/>}
    </View>
    {tablet?<View style={x.right}><Image source={meal.image} style={x.tabletHero}/><View style={x.tip}><Text style={x.tipTitle}>Mẹo nhỏ</Text><Text style={x.muted}>Chuẩn bị và định lượng nguyên liệu trước khi nấu để các bước diễn ra nhanh, đều vị hơn.</Text></View><Steps compact steps={recipe.steps}/></View>:null}
   </View>
  </ScrollView>
  <View style={x.footer}><Button title={`🛒  Thêm ${missingCount} nguyên liệu cần mua`} outline onPress={addToShopping}/><Button title="Bắt đầu nấu" onPress={()=>router.push(`/cooking/${mealId}`)}/></View>
 </SafeAreaView>;
}

function Nutrition({nutrition}:{nutrition:NutritionInfo}){
 const metrics=[['Năng lượng',nutrition.caloriesKcal,'kcal'],['Protein',nutrition.proteinGrams,'g'],['Tinh bột',nutrition.carbsGrams,'g'],['Chất béo',nutrition.fatGrams,'g'],['Chất xơ',nutrition.fiberGrams,'g'],['Natri',nutrition.sodiumMg,'mg']] as const;
 return <View style={x.panel}><Text style={x.listTitle}>Dinh dưỡng mỗi khẩu phần</Text><View style={x.nutritionGrid}>{metrics.map(([label,value,unit])=><View key={label} style={x.nutritionItem}><Text style={x.nutritionValue}>{value}<Text style={x.nutritionUnit}> {unit}</Text></Text><Text style={x.nutritionLabel}>{label}</Text></View>)}</View><View style={x.disclaimer}><Ionicons name="information-circle-outline" size={19} color={colors.secondary}/><Text style={x.disclaimerText}>Số liệu được ước tính từ công thức và khẩu phần tiêu chuẩn, chỉ dùng để tham khảo; có thể thay đổi theo nguyên liệu và cách nấu thực tế.</Text></View></View>;
}

function Substitutions({ingredients}:{ingredients:RecipeIngredient[]}){
 const available=ingredients.filter(item=>item.substitutions?.length);
 return <View style={x.panel}><Text style={x.listTitle}>Nguyên liệu thay thế</Text><Text style={x.ingredientHint}>Giữ tỷ lệ gợi ý để hương vị và kết cấu gần với công thức gốc.</Text>{available.length?available.map(item=><View key={item.id} style={x.substitutionGroup}><Text style={x.substitutionOriginal}>{item.name} · {item.quantity}</Text>{item.substitutions!.map(option=><View key={option.id} style={x.substitution}><Ionicons name="swap-horizontal" size={20} color={colors.primaryDark}/><View style={x.ingredientCopy}><Text style={x.substitutionName}>{option.name} · {option.ratio}</Text><Text style={x.muted}>{option.note}</Text></View></View>)}</View>):<View style={x.emptyPanel}><Ionicons name="leaf-outline" size={28} color={colors.primary}/><Text style={x.muted}>Công thức này chưa có nguyên liệu thay thế đã được biên tập.</Text></View>}</View>;
}

function Steps({steps,compact=false}:{steps:RecipeStep[];compact?:boolean}){
 return <View style={x.steps}><Text style={x.listTitle}>{compact?'Các bước nấu':'Hướng dẫn nấu'}</Text>{steps.map(step=><View key={step.id} style={x.step}><View style={x.num}><Text style={x.numText}>{step.order}</Text></View><Text style={x.stepText}>{step.description}</Text></View>)}</View>;
}

const x=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.background},header:{height:58,flexDirection:'row',alignItems:'center',paddingHorizontal:12,gap:8,borderBottomWidth:1,borderColor:colors.border},back:{width:44,height:44,alignItems:'center',justifyContent:'center'},headerTitle:{flex:1,fontWeight:'800',fontSize:17,color:colors.primaryDark},headerIcons:{flexDirection:'row',gap:6},page:{padding:16,paddingBottom:95,maxWidth:1050,width:'100%',alignSelf:'center'},layout:{gap:18},layoutTablet:{flexDirection:'row'},left:{flex:1,gap:14},right:{flex:1,gap:14},metaCard:{gap:10},title:{fontSize:25,fontWeight:'800',color:colors.primaryDark},meta:{flexDirection:'row',flexWrap:'wrap',gap:15},recipeStatus:{minHeight:42,flexDirection:'row',alignItems:'center',gap:9,paddingHorizontal:12,borderRadius:12,backgroundColor:'#FFF3DF'},statusText:{fontSize:12,color:colors.muted,fontWeight:'700'},hero:{width:'100%',height:250,borderRadius:18},tabletHero:{width:'100%',height:390,borderRadius:18},tabs:{flexDirection:'row',borderBottomWidth:1,borderColor:colors.border},tab:{flex:1,minHeight:46,alignItems:'center',justifyContent:'center'},tabActive:{borderBottomWidth:2,borderColor:colors.primary},tabText:{fontSize:11},tabTextActive:{color:colors.primaryDark,fontWeight:'800'},list:{backgroundColor:'#fff',borderRadius:16,padding:12},listTitle:{fontSize:16,fontWeight:'800',marginBottom:8},ingredientHint:{fontSize:12,color:colors.muted,marginBottom:6},item:{minHeight:55,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:colors.border,paddingHorizontal:5,gap:10},ingredientCopy:{flex:1},preparation:{fontSize:11,color:colors.muted,marginTop:3,marginLeft:25},itemAvailable:{backgroundColor:'#EFF8E9'},availableText:{color:colors.primaryDark,fontWeight:'700'},steps:{backgroundColor:'#fff',borderRadius:16,padding:14,gap:15},step:{flexDirection:'row',gap:11},num:{width:28,height:28,borderRadius:14,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},numText:{color:'#fff',fontWeight:'800'},stepText:{flex:1,lineHeight:21},panel:{backgroundColor:'#fff',padding:16,borderRadius:16},nutritionGrid:{flexDirection:'row',flexWrap:'wrap',gap:9},nutritionItem:{width:'31%',flexGrow:1,minWidth:100,backgroundColor:colors.soft,borderRadius:13,padding:12},nutritionValue:{fontSize:19,fontWeight:'800',color:colors.primaryDark},nutritionUnit:{fontSize:11,fontWeight:'600'},nutritionLabel:{fontSize:11,color:colors.muted,marginTop:4},disclaimer:{flexDirection:'row',gap:8,backgroundColor:'#FFF5E3',padding:11,borderRadius:12,marginTop:13},disclaimerText:{flex:1,fontSize:11,color:colors.muted,lineHeight:17},substitutionGroup:{borderTopWidth:1,borderColor:colors.border,paddingTop:12,marginTop:7,gap:8},substitutionOriginal:{fontWeight:'800'},substitution:{flexDirection:'row',gap:9,alignItems:'center',backgroundColor:colors.soft,padding:11,borderRadius:12},substitutionName:{fontWeight:'800',color:colors.primaryDark},emptyPanel:{alignItems:'center',padding:25,gap:8},muted:{color:colors.muted,lineHeight:20},tip:{padding:16,borderRadius:15,backgroundColor:'#FFF5D9'},tipTitle:{fontWeight:'800',color:'#B66A00',marginBottom:6},footer:{position:'absolute',left:0,right:0,bottom:0,minHeight:76,backgroundColor:'#fff',borderTopWidth:1,borderColor:colors.border,padding:12,flexDirection:'row',gap:8},
});
