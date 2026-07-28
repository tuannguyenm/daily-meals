import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const lines=`
thit-kho-mang|lunch|Thịt kho măng|main|kho|Thịt ba chỉ|550g|Măng tươi|400g|Hành tím|3 củ|Canh rau;Cơm nóng
thit-ram-tom|lunch|Thịt ram tôm|main|ram|Thịt ba chỉ|400g|Tôm tươi|300g|Hành lá|3 nhánh|Canh bầu;Cơm nóng
thit-ba-chi-cuon-nam|lunch|Ba chỉ cuộn nấm|main|nuong|Thịt ba chỉ|500g|Nấm kim châm|300g|Hành lá|3 nhánh|Salad rau;Cơm nóng
suon-kho-sau|lunch|Sườn kho sấu|main|kho|Sườn non|650g|Sấu|8 quả|Hành tím|3 củ|Rau luộc;Cơm nóng
suon-rim-mat-ong|lunch|Sườn rim mật ong|main|ram|Sườn non|650g|Mật ong|3 muỗng canh|Tỏi|5 tép|Canh cải;Cơm nóng
suon-xao-sa-ot|lunch|Sườn xào sả ớt|main|xao|Sườn non|650g|Sả|5 cây|Ớt chuông|1 quả|Dưa leo;Cơm nóng
ga-kho-mang|lunch|Gà kho măng|main|kho|Thịt gà|700g|Măng tươi|400g|Gừng|1 củ|Rau luộc;Cơm nóng
ga-xao-gung|lunch|Gà xào gừng|main|xao|Thịt gà|650g|Gừng|1 củ|Hành tây|1 củ|Canh rau;Cơm nóng
ga-sot-cam|lunch|Gà sốt cam|main|sot|Ức gà|500g|Cam vàng|2 quả|Ớt chuông|1 quả|Salad rau;Cơm nóng
ga-nau-dau|lunch|Gà nấu đậu|main|om|Thịt gà|700g|Đậu trắng|250g|Cà rốt|2 củ|Bánh mì;Rau thơm
bo-xao-mang|lunch|Bò xào măng|main|xao|Thịt bò|450g|Măng tươi|350g|Hành lá|3 nhánh|Canh cà chua;Cơm nóng
bo-xao-sup-lo|lunch|Bò xào súp lơ|main|xao|Thịt bò|450g|Súp lơ trắng|400g|Cà rốt|1 củ|Canh nhẹ;Cơm nóng
bo-sot-me|lunch|Bò sốt me|main|sot|Thịt bò|500g|Me chín|70g|Hành tây|1 củ|Dưa leo;Cơm nóng
bo-kho-sa|lunch|Bò kho sả|main|kho|Thịt bò|600g|Sả|5 cây|Cà rốt|2 củ|Rau luộc;Cơm nóng
ca-ro-kho-khe|lunch|Cá rô kho khế|main|kho|Cá rô|700g|Khế chua|3 quả|Hành lá|3 nhánh|Canh rau;Cơm nóng
ca-bong-kho-tieu|lunch|Cá bống kho tiêu|main|kho|Cá bống|600g|Tiêu xanh|3 nhánh|Hành tím|3 củ|Canh bầu;Cơm nóng
ca-thu-kho-nuoc-dua|lunch|Cá thu kho nước dừa|main|kho|Cá thu|650g|Nước dừa|350ml|Hành lá|3 nhánh|Rau luộc;Cơm nóng
ca-dieu-hong-sot-me|lunch|Cá diêu hồng sốt me|main|sot|Cá diêu hồng|1 con 900g|Me chín|70g|Rau răm|1 bó nhỏ|Dưa leo;Cơm nóng
tom-rim-dua|lunch|Tôm rim dừa|main|ram|Tôm tươi|600g|Cùi dừa non|200g|Hành lá|3 nhánh|Canh cải;Cơm nóng
tom-xao-bong-cai|lunch|Tôm xào bông cải|main|xao|Tôm tươi|550g|Bông cải xanh|350g|Cà rốt|1 củ|Canh nhẹ;Cơm nóng
muc-xao-chua-ngot|lunch|Mực xào chua ngọt|main|xao|Mực tươi|550g|Dứa|1/2 quả|Ớt chuông|2 quả|Cơm nóng;Canh rau
muc-kho-tieu|lunch|Mực kho tiêu|main|kho|Mực ống|600g|Tiêu xanh|3 nhánh|Hành lá|3 nhánh|Rau luộc;Cơm nóng
trung-chien-nam-rom|lunch|Trứng chiên nấm rơm|main|chien|Trứng gà|6 quả|Nấm rơm|250g|Hành lá|3 nhánh|Canh rau;Cơm nóng
trung-sot-ca|lunch|Trứng sốt cà chua|main|sot|Trứng gà|6 quả|Cà chua|5 quả|Hành tây|1/2 củ|Dưa leo;Cơm nóng
dau-hu-kho-dua|lunch|Đậu hũ kho dứa|main|kho|Đậu hũ|5 miếng|Dứa|1/2 quả|Nấm rơm|200g|Canh cải;Cơm nóng
dau-hu-sot-nam|lunch|Đậu hũ sốt nấm|main|sot|Đậu hũ non|3 hộp|Nấm hương|150g|Cải thìa|250g|Cơm nóng;Canh nhẹ
thit-bam-chung-mam|lunch|Thịt băm chưng mắm|main|hap|Thịt heo xay|500g|Mắm cá linh|100g|Trứng gà|2 quả|Dưa leo;Cơm nóng
mam-chung-thit|lunch|Mắm chưng thịt trứng|main|hap|Thịt heo xay|400g|Trứng vịt|4 quả|Mắm cá sặc|100g|Rau sống;Cơm nóng
cha-com|lunch|Chả cốm|main|chien|Thịt heo xay|450g|Cốm xanh|150g|Hành tím|3 củ|Bún tươi;Rau sống
cha-que|lunch|Chả quế|main|nuong|Thịt heo xay|600g|Bột quế|1 muỗng cà phê|Nước mắm|3 muỗng canh|Dưa leo;Cơm nóng
ca-chien-sot-mam-toi|lunch|Cá chiên sốt mắm tỏi|main|chien|Cá rô phi|1 con 900g|Tỏi|8 tép|Ớt|2 quả|Xoài xanh;Cơm nóng
ga-chien-gion|lunch|Gà chiên giòn|main|chien|Đùi gà|6 chiếc|Bột chiên giòn|150g|Tỏi|5 tép|Xà lách;Cà chua
heo-chien-xu|lunch|Heo chiên xù|main|chien|Thịt thăn heo|600g|Bột chiên xù|180g|Trứng gà|2 quả|Salad bắp cải;Cơm nóng
bo-ap-chao-tieu-den|lunch|Bò áp chảo tiêu đen|main|chien|Thịt bò|600g|Tiêu đen|2 muỗng cà phê|Hành tây|1 củ|Khoai tây;Salad
ca-hap-bia|lunch|Cá hấp bia|main|hap|Cá chép|1 con 1kg|Bia|330ml|Sả|5 cây|Rau sống;Bún tươi
tom-hap-bia|lunch|Tôm hấp bia|main|hap|Tôm sú|700g|Bia|330ml|Sả|5 cây|Muối tiêu chanh;Rau răm
thit-heo-hap-sa|lunch|Thịt heo hấp sả|main|hap|Thịt nạc vai|650g|Sả|6 cây|Gừng|1 củ|Rau sống;Bún tươi
ga-hap-muoi|lunch|Gà hấp muối|main|hap|Gà ta|1 con 1.4kg|Muối hột|500g|Sả|6 cây|Rau răm;Muối tiêu chanh
ca-nuong-nghe|lunch|Cá nướng nghệ|main|nuong|Cá lóc|1 con 1kg|Nghệ tươi|2 củ|Sả|4 cây|Bún tươi;Rau sống
thit-nuong-mat-ong|lunch|Thịt nướng mật ong|main|nuong|Thịt nạc vai|650g|Mật ong|3 muỗng canh|Sả|4 cây|Đồ chua;Cơm nóng
ba-chi-nuong-sa-te|dinner|Ba chỉ nướng sa tế|main|nuong|Thịt ba chỉ|700g|Sa tế|3 muỗng canh|Sả|5 cây|Rau sống;Bún tươi
ba-chi-cuon-rau-cu|dinner|Ba chỉ cuộn rau củ|main|nuong|Thịt ba chỉ|600g|Măng tây|300g|Cà rốt|1 củ|Salad rau;Cơm nóng
suon-om-sau|dinner|Sườn om sấu|main|om|Sườn non|700g|Sấu|10 quả|Cà chua|3 quả|Bún tươi;Rau thơm
suon-ham-cu-qua|dinner|Sườn hầm củ quả|main|om|Sườn non|700g|Khoai tây|3 củ|Cà rốt|2 củ|Bánh mì;Rau thơm
ga-nuong-tieu-xanh|dinner|Gà nướng tiêu xanh|main|nuong|Đùi gà|6 chiếc|Tiêu xanh|4 nhánh|Mật ong|2 muỗng canh|Salad rau;Cơm nóng
ga-om-chao|dinner|Gà om chao|main|om|Thịt gà|800g|Chao đỏ|4 viên|Khoai môn|450g|Bún tươi;Rau muống
ga-nau-pate|dinner|Gà nấu pa-tê|main|om|Thịt gà|800g|Pa-tê|150g|Cà rốt|2 củ|Bánh mì;Rau thơm
ga-xao-mang|dinner|Gà xào măng|main|xao|Thịt gà|650g|Măng tươi|400g|Hành lá|3 nhánh|Canh rau;Cơm nóng
bo-nau-tieu-xanh|dinner|Bò nấu tiêu xanh|main|om|Thịt bò|700g|Tiêu xanh|5 nhánh|Khoai tây|3 củ|Bánh mì;Rau thơm
bo-cuon-la-cai|dinner|Bò cuộn lá cải|main|nuong|Thịt bò lát|600g|Cải xanh|2 bó|Hành lá|3 nhánh|Nước chấm mè;Cơm nóng
bo-hap-gung|dinner|Bò hấp gừng|main|hap|Thịt bò|600g|Gừng|2 củ|Hành tây|1 củ|Rau thơm;Bún tươi
bo-nuong-tang|dinner|Bò nướng tảng|main|nuong|Thăn bò|800g|Tỏi|8 tép|Bơ lạt|60g|Khoai tây;Salad
ca-bop-kho-tieu|dinner|Cá bớp kho tiêu|main|kho|Cá bớp|700g|Tiêu xanh|3 nhánh|Nước dừa|300ml|Rau luộc;Cơm nóng
ca-dua-kho-thom|dinner|Cá dứa kho thơm|main|kho|Cá dứa|700g|Dứa|1/2 quả|Cà chua|2 quả|Canh rau;Cơm nóng
ca-hoi-sot-chanh-day|dinner|Cá hồi sốt chanh dây|main|sot|Cá hồi|650g|Chanh dây|4 quả|Măng tây|300g|Khoai nghiền;Salad
ca-tam-nuong-rieng|dinner|Cá tầm nướng riềng|main|nuong|Cá tầm|800g|Riềng|1 củ|Mẻ|3 muỗng canh|Bún tươi;Rau sống
tom-sot-trung-muoi|dinner|Tôm sốt trứng muối|main|sot|Tôm sú|700g|Trứng muối|5 quả|Bơ lạt|50g|Bánh mì;Salad
tom-nuong-pho-mai|dinner|Tôm nướng phô mai|main|nuong|Tôm sú|700g|Phô mai|180g|Bơ lạt|50g|Salad rau;Bánh mì
muc-chien-nuoc-mam|dinner|Mực chiên nước mắm|main|chien|Mực ống|650g|Tỏi|8 tép|Nước mắm|3 muỗng canh|Dưa leo;Rau răm
muc-hap-bia|dinner|Mực hấp bia|main|hap|Mực tươi|700g|Bia|330ml|Sả|5 cây|Rau răm;Nước chấm gừng
bach-tuoc-xao-sa-te|dinner|Bạch tuộc xào sa tế|main|xao|Bạch tuộc|700g|Sa tế|3 muỗng canh|Hành tây|1 củ|Dưa leo;Cơm nóng
bach-tuoc-nuong|dinner|Bạch tuộc nướng|main|nuong|Bạch tuộc|800g|Sả|5 cây|Ớt|3 quả|Rau răm;Dưa leo
cua-rang-me|dinner|Cua rang me|main|sot|Cua biển|1kg|Me chín|100g|Rau răm|1 bó|Bánh mì;Dưa leo
ghe-hap-bia|dinner|Ghẹ hấp bia|main|hap|Ghẹ|1kg|Bia|330ml|Sả|6 cây|Muối tiêu chanh;Rau răm
so-diep-nuong-mo-hanh|dinner|Sò điệp nướng mỡ hành|main|nuong|Sò điệp|1kg|Hành lá|1 bó|Đậu phộng|100g|Rau răm;Nước chấm
hau-nuong-mo-hanh|dinner|Hàu nướng mỡ hành|main|nuong|Hàu|1kg|Hành lá|1 bó|Đậu phộng|100g|Rau răm;Nước chấm
trung-hap-tom|dinner|Trứng hấp tôm|main|hap|Trứng gà|6 quả|Tôm tươi|300g|Hành lá|3 nhánh|Rau luộc;Cơm nóng
trung-duc-hau|dinner|Trứng đúc hàu|main|chien|Trứng gà|6 quả|Hàu sữa|350g|Hành lá|3 nhánh|Canh rau;Cơm nóng
dau-hu-bao-bo|dinner|Đậu hũ bao bố|main|hap|Đậu hũ|6 miếng|Thịt heo xay|300g|Nấm hương|100g|Cải thìa;Cơm nóng
tau-hu-ky-cuon-thit|dinner|Tàu hũ ky cuộn thịt|main|chien|Tàu hũ ky|8 lá|Thịt heo xay|400g|Nấm mèo|80g|Rau luộc;Cơm nóng
cha-oc|dinner|Chả ốc|main|hap|Ốc bươu|700g|Thịt heo xay|300g|Lá lốt|25 lá|Bún tươi;Rau sống
cha-muc|dinner|Chả mực|main|chien|Mực mai|700g|Thì là|1 bó|Hành tím|3 củ|Xôi trắng;Dưa leo
gio-heo-ham-mang|dinner|Giò heo hầm măng|main|om|Giò heo|900g|Măng tươi|500g|Hành lá|3 nhánh|Bún tươi;Rau thơm
chan-gio-gia-cay|dinner|Chân giò giả cầy|main|om|Chân giò|900g|Riềng|1 củ|Mẻ|4 muỗng canh|Bún tươi;Rau thơm
thit-bo-ham-rau-cu|dinner|Thịt bò hầm rau củ|main|om|Thịt bò|750g|Khoai tây|3 củ|Cà rốt|2 củ|Bánh mì;Rau thơm
ga-tiem-thuoc-bac|dinner|Gà tiềm thuốc bắc|main|om|Gà ác|2 con|Gói thuốc bắc|1 gói|Hạt sen|150g|Mì trứng;Rau cải
ca-om-dua|dinner|Cá om dưa|main|om|Cá chép|1 con 1kg|Cải chua|500g|Cà chua|3 quả|Bún tươi;Rau thơm
ech-om-chuoi|dinner|Ếch om chuối đậu|main|om|Thịt ếch|700g|Chuối xanh|4 quả|Đậu hũ|3 miếng|Bún tươi;Tía tô
luon-om-chuoi|dinner|Lươn om chuối đậu|main|om|Lươn|700g|Chuối xanh|4 quả|Đậu hũ|3 miếng|Bún tươi;Tía tô
vit-om-sau|dinner|Vịt om sấu|main|om|Thịt vịt|900g|Sấu|12 quả|Khoai sọ|500g|Bún tươi;Rau ngổ
canh-khoai-mo-tom|lunch|Canh khoai mỡ nấu tôm|soup|canh|Tôm tươi|250g|Khoai mỡ|600g|Ngò gai|1 bó nhỏ|Món kho;Cơm nóng
canh-cua-rau-day|lunch|Canh cua rau đay|soup|canh|Cua đồng xay|400g|Rau đay|2 bó|Mướp hương|1 quả|Cà pháo;Cơm nóng
canh-chua-tom|lunch|Canh chua tôm|soup|canh|Tôm tươi|350g|Dứa|1/3 quả|Cà chua|3 quả|Món kho;Cơm nóng
bap-cai-xao-trung|lunch|Bắp cải xào trứng|side|xao|Bắp cải|600g|Trứng gà|3 quả|Hành lá|3 nhánh|Món mặn;Cơm nóng
cai-thia-xao-nam|lunch|Cải thìa xào nấm|side|xao|Cải thìa|500g|Nấm hương|150g|Tỏi|5 tép|Món kho;Cơm nóng
dau-hu-kho-sa-chay|lunch|Đậu hũ kho sả chay|vegetarian|kho|Đậu hũ|5 miếng|Sả|5 cây|Nước dừa|250ml|Rau luộc;Cơm nóng
nam-rom-kho-chay|lunch|Nấm rơm kho chay|vegetarian|kho|Nấm rơm|600g|Tiêu xanh|3 nhánh|Nước dừa|250ml|Canh rau;Cơm nóng
canh-nam-chay|lunch|Canh nấm rau củ chay|vegetarian|canh|Nấm hương|180g|Cà rốt|1 củ|Đậu hũ|3 miếng|Món kho chay;Cơm nóng
pho-xao-chay|lunch|Phở xào chay|vegetarian|xao|Bánh phở|600g|Cải thìa|350g|Nấm đùi gà|250g|Nước tương;Rau thơm
com-tron-rau-cu-chay|lunch|Cơm trộn rau củ chay|vegetarian|tron|Cơm trắng|4 chén|Rau củ thập cẩm|500g|Đậu hũ|3 miếng|Nước tương;Rong biển
canh-rong-bien-thit-bam|dinner|Canh rong biển thịt băm|soup|canh|Thịt heo xay|200g|Rong biển|40g|Đậu hũ non|1 hộp|Món xào;Cơm nóng
canh-bi-do-suon|dinner|Canh bí đỏ nấu sườn|soup|canh|Sườn non|400g|Bí đỏ|600g|Hành lá|3 nhánh|Món rang;Cơm nóng
canh-du-du-gio-heo|dinner|Canh đu đủ giò heo|soup|canh|Giò heo|500g|Đu đủ xanh|700g|Hành lá|3 nhánh|Món mặn;Cơm nóng
dau-bap-luoc-cham-chao|dinner|Đậu bắp luộc chấm chao|side|luoc|Đậu bắp|600g|Chao|4 viên|Chanh|1 quả|Món kho;Cơm nóng
su-su-xao-toi|dinner|Su su xào tỏi|side|xao|Su su|3 quả|Tỏi|6 tép|Hành lá|3 nhánh|Món mặn;Cơm nóng
dau-hu-sot-nam-dong-co|dinner|Đậu hũ sốt nấm đông cô chay|vegetarian|sot|Đậu hũ|5 miếng|Nấm đông cô|180g|Cải thìa|300g|Canh rau;Cơm nóng
nam-xao-hat-dieu|dinner|Nấm xào hạt điều chay|vegetarian|xao|Nấm đùi gà|500g|Hạt điều|100g|Ớt chuông|2 quả|Canh chay;Cơm nóng
lau-nam-chay|dinner|Lẩu nấm chay|vegetarian|om|Nấm thập cẩm|800g|Đậu hũ|4 miếng|Cải thảo|400g|Bún tươi;Rau xanh
nui-xao-chay|dinner|Nui xào rau củ chay|vegetarian|xao|Nui|500g|Bông cải xanh|300g|Nấm rơm|250g|Nước tương;Salad
chao-nam-chay|dinner|Cháo nấm chay|vegetarian|om|Gạo tẻ|220g|Nấm hương|150g|Cà rốt|1 củ|Rau thơm;Tiêu xay
`.trim().split(/\r?\n/);

const meals=lines.map((line,index)=>{
 const [id,type,title,kind,method,main,mainQty,vegetable,vegetableQty,extra,extraQty,sides]=line.split('|');
 if(!sides)throw new Error(`Invalid row ${index+1}: ${line}`);
 return{id,type,title,kind,method,main,mainQty,vegetable,vegetableQty,extra,extraQty,sideDishes:sides.split(';')};
});
if(meals.length!==100)throw new Error(`Expected 100 meals, received ${meals.length}`);
if(new Set(meals.map(meal=>meal.id)).size!==100)throw new Error('Duplicate meal id');
if(meals.filter(meal=>meal.type==='lunch').length!==50||meals.filter(meal=>meal.type==='dinner').length!==50)throw new Error('Expected 50 lunch and 50 dinner meals');

const M='Thịt & Hải sản',V='Rau củ',P='Gia vị & Khác',G='Gạo & mì';
const category=name=>{
 if(/thịt|sườn|gà|bò|cá|tôm|mực|nghêu|ốc|trứng|vịt|dê|lươn|ếch|cua|ghẹ|sò|hàu|bạch tuộc|giò|chân giò|chả/i.test(name))return M;
 if(/cơm|bún|miến|bánh|phở|nui|gạo|xôi/i.test(name))return G;
 if(/rau|cải|bí|mướp|dứa|hành|sả|gừng|cà|nấm|khổ qua|khoai|măng|bầu|giá|hẹ|tỏi|lá|thì là|đậu|sấu|khế|cam|chanh|su su|đu đủ/i.test(name))return V;
 return P;
};
const pantry={
 kho:[['Nước mắm','3 muỗng canh',P],['Đường','1 muỗng canh',P],['Tiêu xay','1/2 muỗng cà phê',P]],
 ram:[['Nước mắm','3 muỗng canh',P],['Đường','1 muỗng canh',P],['Dầu ăn','2 muỗng canh',P]],
 xao:[['Tỏi','4 tép',P],['Dầu hào','2 muỗng canh',P],['Dầu ăn','2 muỗng canh',P]],
 chien:[['Bột bắp','2 muỗng canh',P],['Dầu ăn','250ml',P],['Nước mắm','2 muỗng canh',P]],
 hap:[['Gừng','1 củ',V],['Nước mắm','2 muỗng canh',P],['Tiêu xay','1/2 muỗng cà phê',P]],
 nuong:[['Tỏi','5 tép',P],['Nước mắm','3 muỗng canh',P],['Dầu ăn','2 muỗng canh',P]],
 sot:[['Tỏi','4 tép',P],['Nước mắm','2 muỗng canh',P],['Đường','1 muỗng canh',P]],
 om:[['Hành tím','4 củ',P],['Nước mắm','3 muỗng canh',P],['Nước dùng','700ml',P]],
 luoc:[['Gừng','1 củ',V],['Muối','1 muỗng canh',P],['Nước lọc','2 lít',P]],
 canh:[['Hành tím','2 củ',P],['Nước mắm','2 muỗng canh',P],['Nước lọc','1.2 lít',P]],
 tron:[['Nước tương','3 muỗng canh',P],['Dầu mè','1 muỗng canh',P],['Mè rang','2 muỗng canh',P]],
};
const verbs={kho:'kho',ram:'rim',xao:'xào',chien:'chiên',hap:'hấp',nuong:'nướng',sot:'nấu sốt',om:'nấu mềm',luoc:'luộc',canh:'nấu canh',tron:'trộn'};
const minutes={kho:35,ram:30,xao:20,chien:25,hap:30,nuong:40,sot:30,om:45,luoc:20,canh:25,tron:20};
const recipes={};
const catalogMeals=meals.map((seed,index)=>{
 const ingredients=[
  [seed.main,seed.mainQty,category(seed.main)],
  [seed.vegetable,seed.vegetableQty,category(seed.vegetable)],
  [seed.extra,seed.extraQty,category(seed.extra)],
  ...pantry[seed.method],
 ].filter((item,position,all)=>all.findIndex(other=>other[0].toLocaleLowerCase('vi-VN')===item[0].toLocaleLowerCase('vi-VN'))===position);
 for(const fallback of [['Muối','1/2 muỗng cà phê',P],['Tiêu xay','1/2 muỗng cà phê',P],['Đường','1 muỗng cà phê',P]]){
  if(ingredients.length>=5)break;
  if(!ingredients.some(item=>item[0]===fallback[0]))ingredients.push(fallback);
 }
 const lower=seed.title.toLocaleLowerCase('vi-VN'),main=seed.main.toLocaleLowerCase('vi-VN');
 const steps=seed.method==='canh'?[
  `Sơ chế ${main}, ${seed.vegetable.toLocaleLowerCase('vi-VN')} và ${seed.extra.toLocaleLowerCase('vi-VN')}; rửa sạch rồi cắt vừa ăn.`,
  `Phi thơm hành tím, cho ${main} vào đảo săn và nêm nhẹ.`,
  `Thêm nước, đun sôi rồi cho ${seed.vegetable.toLocaleLowerCase('vi-VN')} cùng ${seed.extra.toLocaleLowerCase('vi-VN')} vào nấu vừa chín.`,
  `Nêm nước mắm vừa ăn, tắt bếp và dùng ${lower} khi còn nóng.`,
 ]:seed.method==='tron'?[
  `Chuẩn bị ${main}, ${seed.vegetable.toLocaleLowerCase('vi-VN')} và ${seed.extra.toLocaleLowerCase('vi-VN')}, để ráo.`,
  'Pha nước trộn từ nước tương, dầu mè và mè rang.',
  'Trộn đều nguyên liệu với nước sốt, đảo nhẹ để không làm nát.',
  `Để ${lower} thấm 5 phút rồi dùng ngay.`,
 ]:[
  `Sơ chế ${main}, ${seed.vegetable.toLocaleLowerCase('vi-VN')} và ${seed.extra.toLocaleLowerCase('vi-VN')}; cắt miếng vừa ăn.`,
  `Ướp ${main} với gia vị chính trong 15 phút để thấm đều.`,
  `${verbs[seed.method][0].toLocaleUpperCase('vi-VN')+verbs[seed.method].slice(1)} ${main} đúng độ chín, sau đó thêm ${seed.vegetable.toLocaleLowerCase('vi-VN')} và ${seed.extra.toLocaleLowerCase('vi-VN')}.`,
  `Nêm lại vừa ăn, hoàn thiện ${lower} và dùng nóng cùng ${seed.sideDishes.join(' và ').toLocaleLowerCase('vi-VN')}.`,
 ];
 recipes[seed.id]={
  ingredients:ingredients.map(([name,quantity,ingredientCategory],ingredientIndex)=>({
   name,quantity,category:ingredientCategory,
   preparation:ingredientIndex<3?'Sơ chế theo bước 1':undefined,
   substitutions:[],
  })),
  steps,
 };
 const vegetarian=seed.kind==='vegetarian',soup=seed.kind==='soup';
 const seafood=/cá|tôm|mực|nghêu|ốc|cua|ghẹ|sò|hàu|bạch tuộc|lươn/i.test(seed.main);
 return{
  id:seed.id,slug:seed.id,type:seed.type,title:seed.title,
  summary:`Món ${vegetarian?'chay ':''}${lower} phù hợp cho bữa ${seed.type==='lunch'?'trưa':'tối'} gia đình.`,
  sideDishes:seed.sideDishes,cookingTimeMinutes:minutes[seed.method]+(index%3)*5,
  estimatedCost:vegetarian?90000:/bò|cá hồi|tôm sú|cua|ghẹ|sò điệp|hàu|bạch tuộc|dê/i.test(seed.main)?200000:145000,
  servings:4,missingIngredients:[seed.vegetable],status:'unconfirmed',
  cuisine:'vietnamese',difficulty:minutes[seed.method]>=40?'medium':'easy',
  tags:['home-cooked-v3',seed.kind,seed.method,seed.type,vegetarian?'vegetarian':'family'],
  nutrition:{
   caloriesKcal:soup?155:vegetarian?335:seafood?395:475,
   proteinGrams:soup?14:vegetarian?17:seafood?32:35,
   carbsGrams:soup?13:vegetarian?43:seafood?23:25,
   fatGrams:soup?6:vegetarian?13:seafood?19:27,
   fiberGrams:soup?4:vegetarian?8:seafood?4:3,
   sodiumMg:soup?620:vegetarian?690:seafood?780:850,
   perServing:true,estimateMethod:'editorial_recipe_estimate',
  },
  mealSource:'home_cooked',
 };
});

const output={version:1,generatedAt:'2026-07-28',meals:catalogMeals,recipes};
mkdirSync(resolve('content'),{recursive:true});
writeFileSync(resolve('content/home-cooked-expansion-2.json'),`${JSON.stringify(output,null,2)}\n`,'utf8');
const imageLines=catalogMeals.map(meal=>` '${meal.id}':require('../assets/images/meals/home-cooked-v3/${meal.id}.webp'),`).join('\n');
writeFileSync(resolve('src/home-cooked-expansion-2.ts'),`// Generated by scripts/catalog/generate-home-cooked-expansion-2.mjs.
import {Meal,RecipeData} from './types';
import catalog from '../content/home-cooked-expansion-2.json';
const images:Record<string,Meal['image']>={
${imageLines}
};
export const expandedHomeCookedMeals2:Meal[]=catalog.meals.map(meal=>({
 ...meal,image:images[meal.id],type:meal.type as Meal['type'],
 status:meal.status as Meal['status'],difficulty:meal.difficulty as Meal['difficulty'],
 mealSource:'home_cooked',
}));
export const expandedHomeCookedRecipes2:Record<string,RecipeData>=Object.fromEntries(
 Object.entries(catalog.recipes).map(([mealId,recipe])=>[mealId,{
  mealId,
  ingredients:recipe.ingredients.map((item,index)=>({
   ...item,id:\`\${mealId}-ingredient-\${index+1}\`,available:false,
   substitutions:[],
  })),
  steps:recipe.steps.map((description,index)=>({
   id:\`\${mealId}-step-\${index+1}\`,order:index+1,description,
  })),
 }]),
);
`,'utf8');
console.log(JSON.stringify({
 meals:catalogMeals.length,lunch:catalogMeals.filter(meal=>meal.type==='lunch').length,
 dinner:catalogMeals.filter(meal=>meal.type==='dinner').length,
 soupsAndSides:catalogMeals.filter(meal=>meal.tags.includes('soup')||meal.tags.includes('side')).length,
 vegetarian:catalogMeals.filter(meal=>meal.tags.includes('vegetarian')).length,
 ingredients:Object.values(recipes).reduce((sum,recipe)=>sum+recipe.ingredients.length,0),
 steps:Object.values(recipes).reduce((sum,recipe)=>sum+recipe.steps.length,0),
}));
