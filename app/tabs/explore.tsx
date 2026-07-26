import {router} from 'expo-router';
import {useState} from 'react';
import {ActivityIndicator,Image,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Button,Page,Screen} from '../../src/components';
import {useMealCatalog} from '../../src/use-catalog';
import {colors} from '../../src/theme';
import {MealType} from '../../src/types';

const filters=[
 {label:'Tất cả'},
 {label:'Bữa sáng',type:'breakfast' as MealType},
 {label:'Bữa trưa',type:'lunch' as MealType},
 {label:'Bữa tối',type:'dinner' as MealType},
 {label:'Nấu nhanh',maxPrepMinutes:20},
 {label:'Tiết kiệm',tags:['budget']},
];

export default function Explore(){
 const [search,setSearch]=useState(''),[active,setActive]=useState(0),filter=filters[active];
 const {page,loading,loadingMore,error,loadMore}=useMealCatalog({search,type:filter.type,tags:filter.tags,maxPrepMinutes:filter.maxPrepMinutes,limit:20});
 return <Screen><Page>
  <View><Text accessibilityRole="header" style={x.title}>Khám phá món ăn</Text><Text style={x.subtitle}>Tìm trong catalog món ăn của gia đình.</Text></View>
  <TextInput accessibilityLabel="Tìm món ăn" placeholder="Tìm phở, món gà, món nấu nhanh…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={x.search}/>
  <View style={x.categories}>{filters.map((filterItem,index)=><Pressable accessibilityRole="button" accessibilityLabel={`Lọc ${filterItem.label}`} accessibilityState={{selected:index===active}} key={filterItem.label} onPress={()=>setActive(index)} style={[x.category,index===active&&x.categoryActive]}><Text style={[x.categoryText,index===active&&x.categoryTextActive]}>{filterItem.label}</Text></Pressable>)}</View>
  <View style={x.sectionRow}><Text style={x.section}>{search?'Kết quả tìm kiếm':'Món ăn'}</Text><Text style={x.count}>{page.total} món</Text></View>
  {loading?<View accessibilityLiveRegion="polite" style={x.loading}><ActivityIndicator color={colors.primary}/><Text style={x.subtitle}>Đang tải catalog…</Text></View>:error&&!page.meals.length?<Text accessibilityLiveRegion="assertive" style={x.empty}>Không thể tải catalog lúc này.</Text>:page.meals.length?<View style={x.grid}>{page.meals.map(meal=><Pressable accessibilityRole="button" accessibilityLabel={`Xem công thức ${meal.title}`} key={meal.id} style={x.card} onPress={()=>router.push(`/recipe/${meal.id}`)}><Image source={meal.image} style={x.image}/><View style={x.copy}><Text style={x.meal} numberOfLines={2}>{meal.title}</Text>{meal.summary?<Text numberOfLines={1} style={x.summary}>{meal.summary}</Text>:null}<Text style={x.meta}>{meal.cookingTimeMinutes} phút · ~{meal.estimatedCost.toLocaleString('vi-VN')}đ</Text></View></Pressable>)}</View>:<Text accessibilityLiveRegion="polite" style={x.empty}>Không tìm thấy món phù hợp.</Text>}
  {page.hasMore?<View style={x.more}><Button title={loadingMore?'Đang tải…':'Xem thêm món'} outline onPress={()=>void loadMore()}/></View>:null}
 </Page></Screen>
}
const x=StyleSheet.create({title:{fontSize:26,fontWeight:'800',color:colors.primaryDark},subtitle:{color:colors.muted,marginTop:5},search:{minHeight:50,borderWidth:1,borderColor:colors.border,borderRadius:14,paddingHorizontal:15,backgroundColor:'#fff'},categories:{flexDirection:'row',flexWrap:'wrap',gap:8},category:{minHeight:44,paddingHorizontal:15,borderRadius:22,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'},categoryActive:{backgroundColor:colors.primary,borderColor:colors.primary},categoryText:{fontWeight:'700'},categoryTextActive:{color:'#fff'},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},section:{fontSize:18,fontWeight:'800'},count:{fontSize:12,color:colors.muted,fontWeight:'700'},loading:{minHeight:220,alignItems:'center',justifyContent:'center',gap:10},empty:{padding:30,textAlign:'center',color:colors.muted},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},card:{width:'48%',flexGrow:1,maxWidth:350,backgroundColor:'#fff',borderRadius:16,overflow:'hidden',borderWidth:1,borderColor:colors.border},image:{width:'100%',height:150},copy:{padding:11},meal:{fontWeight:'800',fontSize:16},summary:{fontSize:11,color:colors.muted,marginTop:4},meta:{fontSize:11,color:colors.muted,marginTop:5},more:{width:'100%',maxWidth:420,alignSelf:'center'}});
