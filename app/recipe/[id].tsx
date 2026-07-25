import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import {useState} from 'react';
import {ActivityIndicator,Image,Pressable,ScrollView,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {persistShoppingSnapshot} from '../../src/cloud-sync';
import {Button,IconButton} from '../../src/components';
import {meals} from '../../src/data';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';
import {RecipeStep} from '../../src/types';
import {useRecipe} from '../../src/use-recipe';

type Tab='ingredients'|'steps'|'nutrition'|'replace';

export default function Recipe(){
 const {id}=useLocalSearchParams<{id:string}>(),mealId=id??meals[0].id,{width}=useWindowDimensions(),tablet=width>=768;
 const meal=meals.find(item=>item.id===mealId)??meals[0],{recipe,source,loading}=useRecipe(meal.id);
 const add=useAppStore(state=>state.addMissing),familyId=useAppStore(state=>state.family?.id),[tab,setTab]=useState<Tab>('ingredients');
 const missingCount=recipe.ingredients.filter(item=>!item.available).length;
 const addToShopping=()=>{add(recipe.ingredients);void persistShoppingSnapshot(familyId).catch(()=>undefined);router.push('/tabs/shopping')};
 return <SafeAreaView style={x.safe}>
  <View style={x.header}>
   <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" style={x.back} onPress={()=>router.back()}><Ionicons name="arrow-back" size={23}/></Pressable>
   <Text style={x.headerTitle} numberOfLines={1}>{meal.title}</Text>
   <View style={x.headerIcons}><IconButton accessibilityLabel="Thêm vào yêu thích" name="heart-outline"/><IconButton accessibilityLabel="Chia sẻ công thức" name="share-social-outline"/></View>
  </View>
  <ScrollView contentContainerStyle={x.page}>
   <View style={[x.layout,tablet&&x.layoutTablet]}>
    <View style={x.left}>
     <View style={x.metaCard}><Text style={x.title}>{meal.title}</Text><View style={x.meta}><Text>⭐ 4.8</Text><Text>◷ {meal.cookingTimeMinutes} phút</Text><Text>♙ {meal.servings} người</Text><Text>💰 ~{meal.estimatedCost.toLocaleString('vi-VN')}đ</Text></View></View>
     {loading?<View accessibilityLiveRegion="polite" style={x.recipeStatus}><ActivityIndicator size="small" color={colors.primary}/><Text style={x.statusText}>Đang cập nhật công thức…</Text></View>:source!=='cloud'?<View accessibilityLiveRegion="polite" style={x.recipeStatus}><Ionicons name="cloud-offline-outline" size={18} color={colors.secondary}/><Text style={x.statusText}>Đang dùng công thức lưu trên thiết bị.</Text></View>:null}
     {!tablet&&<Image source={meal.image} style={x.hero}/>}
     <View accessibilityRole="tablist" style={x.tabs}>{([['ingredients','Nguyên liệu'],['steps','Cách nấu'],['nutrition','Dinh dưỡng'],['replace','Gợi ý']] as const).map(([key,label])=><Pressable accessibilityRole="tab" accessibilityState={{selected:tab===key}} key={key} onPress={()=>setTab(key)} style={[x.tab,tab===key&&x.tabActive]}><Text numberOfLines={1} style={[x.tabText,tab===key&&x.tabTextActive]}>{label}</Text></Pressable>)}</View>
     {tab==='ingredients'?<View style={x.list}><Text style={x.listTitle}>Nguyên liệu ({recipe.ingredients.length})</Text>{recipe.ingredients.map(item=><View key={item.id} style={[x.item,!item.available&&x.missing]} accessibilityRole="checkbox" accessibilityState={{checked:item.available}}><Text style={!item.available&&x.red}>{item.available?'☑':'☐'}　{item.name}</Text><Text style={!item.available&&x.red}>{item.quantity}</Text></View>)}</View>:tab==='steps'?<Steps steps={recipe.steps}/>:<View style={x.placeholder}><Text style={x.listTitle}>{tab==='nutrition'?'Dinh dưỡng cân bằng':'Gợi ý thay thế'}</Text><Text style={x.muted}>{tab==='nutrition'?`Một khẩu phần ${meal.title.toLowerCase()} cung cấp protein, tinh bột và rau củ phù hợp cho bữa ăn gia đình.`:missingCount?`Bạn đang thiếu ${missingCount} nguyên liệu. Có thể chọn nguyên liệu cùng nhóm với lượng tương đương.`:'Bạn đã có đủ nguyên liệu chính cho món này.'}</Text></View>}
    </View>
    {tablet?<View style={x.right}><Image source={meal.image} style={x.tabletHero}/><View style={x.tip}><Text style={x.tipTitle}>Mẹo nhỏ</Text><Text style={x.muted}>Chuẩn bị và định lượng nguyên liệu trước khi nấu để các bước diễn ra nhanh, đều vị hơn.</Text></View><Steps compact steps={recipe.steps}/></View>:null}
   </View>
  </ScrollView>
  <View style={x.footer}><Button title={`🛒  Thêm ${missingCount} nguyên liệu cần mua`} outline onPress={addToShopping}/><Button title="Bắt đầu nấu" onPress={()=>router.push(`/cooking/${meal.id}`)}/></View>
 </SafeAreaView>;
}

function Steps({steps,compact=false}:{steps:RecipeStep[];compact?:boolean}){
 return <View style={x.steps}><Text style={x.listTitle}>{compact?'Các bước nấu':'Hướng dẫn nấu'}</Text>{steps.map(step=><View key={step.id} style={x.step}><View style={x.num}><Text style={x.numText}>{step.order}</Text></View><Text style={x.stepText}>{step.description}</Text></View>)}</View>;
}

const x=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.background},header:{height:58,flexDirection:'row',alignItems:'center',paddingHorizontal:12,gap:8,borderBottomWidth:1,borderColor:colors.border},back:{width:44,height:44,alignItems:'center',justifyContent:'center'},headerTitle:{flex:1,fontWeight:'800',fontSize:17,color:colors.primaryDark},headerIcons:{flexDirection:'row',gap:6},page:{padding:16,paddingBottom:95,maxWidth:1050,width:'100%',alignSelf:'center'},layout:{gap:18},layoutTablet:{flexDirection:'row'},left:{flex:1,gap:14},right:{flex:1,gap:14},metaCard:{gap:10},title:{fontSize:25,fontWeight:'800',color:colors.primaryDark},meta:{flexDirection:'row',flexWrap:'wrap',gap:15},recipeStatus:{minHeight:42,flexDirection:'row',alignItems:'center',gap:9,paddingHorizontal:12,borderRadius:12,backgroundColor:'#FFF3DF'},statusText:{fontSize:12,color:colors.muted,fontWeight:'700'},hero:{width:'100%',height:250,borderRadius:18},tabletHero:{width:'100%',height:390,borderRadius:18},tabs:{flexDirection:'row',borderBottomWidth:1,borderColor:colors.border},tab:{flex:1,minHeight:46,alignItems:'center',justifyContent:'center'},tabActive:{borderBottomWidth:2,borderColor:colors.primary},tabText:{fontSize:11},tabTextActive:{color:colors.primaryDark,fontWeight:'800'},list:{backgroundColor:'#fff',borderRadius:16,padding:12},listTitle:{fontSize:16,fontWeight:'800',marginBottom:8},item:{minHeight:49,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:colors.border,paddingHorizontal:5},missing:{backgroundColor:'#FFF4F1'},red:{color:colors.danger},steps:{backgroundColor:'#fff',borderRadius:16,padding:14,gap:15},step:{flexDirection:'row',gap:11},num:{width:28,height:28,borderRadius:14,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},numText:{color:'#fff',fontWeight:'800'},stepText:{flex:1,lineHeight:21},placeholder:{backgroundColor:'#fff',padding:20,borderRadius:16},muted:{color:colors.muted,lineHeight:20},tip:{padding:16,borderRadius:15,backgroundColor:'#FFF5D9'},tipTitle:{fontWeight:'800',color:'#B66A00',marginBottom:6},footer:{position:'absolute',left:0,right:0,bottom:0,minHeight:76,backgroundColor:'#fff',borderTopWidth:1,borderColor:colors.border,padding:12,flexDirection:'row',gap:8},
});
