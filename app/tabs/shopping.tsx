import {Ionicons} from '@expo/vector-icons';
import {useState} from 'react';
import {Modal,Pressable,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {Button,CloudStatusNotice,IconButton,Input,Page,Screen} from '../../src/components';
import {hydrateCloudData,persistShoppingSnapshot} from '../../src/cloud-sync';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';

const emoji:Record<string,string>={'Rau củ':'🥬','Thịt & Hải sản':'🥩','Gia vị & Khác':'🧂'};

export default function Shopping(){
 const {width}=useWindowDimensions(),tablet=width>=768;
 const items=useAppStore(state=>state.shopping),toggle=useAppStore(state=>state.toggle),add=useAppStore(state=>state.addItem),remove=useAppStore(state=>state.removeItem);
 const familyId=useAppStore(state=>state.family?.id),cloudStatus=useAppStore(state=>state.cloudStatus),cloudError=useAppStore(state=>state.cloudError);
 const [modal,setModal]=useState(false),[name,setName]=useState(''),[editing,setEditing]=useState(false);
 const groups=[...new Set(items.map(item=>item.category))];
 const sync=()=>void persistShoppingSnapshot(familyId).catch(()=>undefined);
 const retry=()=>{if(familyId)void hydrateCloudData(familyId).catch(()=>undefined)};
 const toggleItem=(id:string)=>{toggle(id);sync()};
 const removeItem=(id:string)=>{remove(id);sync()};
 const markAll=()=>{for(const item of useAppStore.getState().shopping)if(!item.checked)toggle(item.id);sync()};
 const addItem=()=>{const trimmed=name.trim();if(trimmed){add({id:`local-${Date.now()}`,name:trimmed,quantity:'1',category:'Gia vị & Khác',checked:false});sync()}setName('');setModal(false)};

 return <Screen>
  <Page>
   <View style={x.header}><Text accessibilityRole="header" style={x.title}>Danh sách mua sắm</Text><View style={x.headerActions}><IconButton accessibilityLabel="Chia sẻ danh sách" name="share-social-outline"/><IconButton accessibilityLabel={editing?'Đóng chỉnh sửa':'Chỉnh sửa danh sách'} name={editing?'checkmark':'ellipsis-horizontal'} onPress={()=>setEditing(value=>!value)}/></View></View>
   <CloudStatusNotice status={cloudStatus} error={cloudError} onRetry={retry}/>
   <View style={[x.cols,tablet&&x.row]}>
    <View style={x.list}>{items.length===0?<View accessibilityLiveRegion="polite" style={x.empty}><Text style={x.emptyIcon}>🛒</Text><Text style={x.group}>Danh sách mua sắm đang trống.</Text><Text style={x.muted}>Hãy chọn một món ăn để thêm nguyên liệu.</Text></View>:groups.map(group=><View key={group} style={x.groupBlock}><View style={x.groupHeader}><Text style={x.group}>{group}</Text><View style={x.count}><Text style={x.countText}>{items.filter(item=>item.category===group).length}</Text></View></View>{items.filter(item=>item.category===group).map(item=><View key={item.id} style={x.item}><Pressable accessibilityRole="checkbox" accessibilityLabel={`${item.name}, ${item.quantity}`} accessibilityState={{checked:item.checked}} onPress={()=>toggleItem(item.id)} style={x.itemToggle}><Ionicons name={item.checked?'checkbox':'square-outline'} size={22} color={item.checked?colors.primary:colors.muted}/><Text>{emoji[group]??'🛒'}</Text><Text style={[x.itemName,item.checked&&x.done]}>{item.name}</Text><Text style={x.quantity}>{item.quantity}</Text></Pressable>{editing?<Pressable accessibilityRole="button" accessibilityLabel={`Xóa ${item.name}`} onPress={()=>removeItem(item.id)} style={x.deleteButton}><Ionicons name="trash-outline" size={20} color={colors.danger}/></Pressable>:null}</View>)}</View>)}</View>
    {tablet?<View style={x.summary}><Text style={x.group}>Tổng quan</Text><View style={x.summaryBox}><Text style={x.big}>{items.length}</Text><Text>mặt hàng</Text></View><Text>Ước tính chi phí</Text><Text style={x.cost}>~345.000đ</Text><Text>{items.filter(item=>item.checked).length} món đã mua</Text><View style={x.saving}><Text style={x.group}>Mẹo tiết kiệm</Text><Text style={x.muted}>Bạn có thể mua combo rau củ tại siêu thị để tiết kiệm khoảng 10–15%.</Text></View></View>:null}
   </View>
  </Page>
  <View style={[x.footer,tablet&&x.footerTablet]}><Button title={`Đánh dấu đã mua (${items.length})`} onPress={markAll}/><Button title="Thêm nguyên liệu" outline onPress={()=>setModal(true)}/></View>
  <Modal accessibilityViewIsModal transparent visible={modal} animationType="fade"><View style={x.overlay}><View style={x.modal}><Text accessibilityRole="header" style={x.group}>Thêm nguyên liệu</Text><Input accessibilityLabel="Tên nguyên liệu" value={name} onChangeText={setName} placeholder="Tên nguyên liệu"/><Button title="Thêm" onPress={addItem}/><Button title="Hủy" outline onPress={()=>setModal(false)}/></View></View></Modal>
 </Screen>;
}

const x=StyleSheet.create({
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},headerActions:{flexDirection:'row',gap:7},title:{fontSize:25,fontWeight:'800',color:colors.primaryDark},cols:{gap:20},row:{flexDirection:'row'},list:{flex:3,paddingBottom:70},summary:{flex:1,backgroundColor:'#fff',borderRadius:16,padding:18,gap:12,alignItems:'center'},groupBlock:{marginBottom:14},groupHeader:{flexDirection:'row',alignItems:'center',gap:8},group:{fontSize:16,fontWeight:'800'},count:{backgroundColor:'#EDF5E8',minWidth:24,height:24,borderRadius:12,alignItems:'center',justifyContent:'center'},countText:{color:colors.primaryDark,fontSize:11,fontWeight:'800'},item:{minHeight:54,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderColor:colors.border},itemToggle:{minHeight:54,flex:1,flexDirection:'row',gap:10,alignItems:'center'},deleteButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},itemName:{flex:1},quantity:{color:colors.muted},done:{textDecorationLine:'line-through',color:colors.muted},big:{fontSize:30,fontWeight:'800',color:colors.primaryDark},cost:{fontSize:20,color:colors.primaryDark,fontWeight:'800'},summaryBox:{width:'100%',padding:14,alignItems:'center',borderWidth:1,borderColor:colors.border,borderRadius:12},saving:{backgroundColor:'#EFF8E9',padding:13,borderRadius:13,marginTop:8},muted:{color:colors.muted,lineHeight:19},empty:{padding:35,alignItems:'center',gap:8},emptyIcon:{fontSize:35},footer:{position:'absolute',left:0,right:0,bottom:78,backgroundColor:'#fff',borderTopWidth:1,borderColor:colors.border,padding:10,gap:8},footerTablet:{bottom:0},overlay:{flex:1,backgroundColor:'#0005',justifyContent:'center',padding:24},modal:{backgroundColor:'#fff',padding:20,borderRadius:18,gap:12,maxWidth:440,width:'100%',alignSelf:'center'},
});
