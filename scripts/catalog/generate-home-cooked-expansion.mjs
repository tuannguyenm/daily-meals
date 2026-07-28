import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const M='Thịt & Hải sản',V='Rau củ',P='Gia vị & Khác',G='Gạo & mì';
const row=(id,type,title,kind,method,main,mainQty,vegetable,vegetableQty,extra,extraQty,sides)=>({
 id,type,title,kind,method,main,mainQty,vegetable,vegetableQty,extra,extraQty,sides,
});

const lunchMain=[
 row('thit-rang-chay-canh','lunch','Thịt rang cháy cạnh','main','rang','Thịt ba chỉ','500g','Hành lá','3 nhánh','Hành tím','3 củ',['Canh rau','Dưa leo']),
 row('thit-kho-mam-ruoc','lunch','Thịt kho mắm ruốc','main','kho','Thịt ba chỉ','500g','Sả','4 cây','Mắm ruốc','2 muỗng canh',['Dưa leo','Cơm nóng']),
 row('thit-xao-mam-ruoc-sa','lunch','Thịt xào mắm ruốc sả','main','xao','Thịt nạc vai','450g','Sả','4 cây','Mắm ruốc','2 muỗng canh',['Rau sống','Cơm nóng']),
 row('suon-ram-man','lunch','Sườn ram mặn','main','ram','Sườn non','600g','Hành lá','3 nhánh','Nước dừa','250ml',['Canh cải','Cơm nóng']),
 row('suon-kho-dua','lunch','Sườn kho dứa','main','kho','Sườn non','600g','Dứa','1/2 quả','Nước dừa','300ml',['Rau luộc','Cơm nóng']),
 row('suon-non-kho-tieu','lunch','Sườn non kho tiêu','main','kho','Sườn non','600g','Hành tím','3 củ','Tiêu xanh','2 nhánh',['Canh bí','Cơm nóng']),
 row('ga-ro-ti','lunch','Gà rô-ti','main','ram','Đùi gà','6 chiếc','Hành tím','4 củ','Nước dừa','300ml',['Xà lách','Cơm nóng']),
 row('ga-kho-sa','lunch','Gà kho sả','main','kho','Thịt gà','650g','Sả','5 cây','Ớt chuông','1 quả',['Canh rau ngót','Cơm nóng']),
 row('ga-xao-hat-dieu','lunch','Gà xào hạt điều','main','xao','Ức gà','450g','Ớt chuông','2 quả','Hạt điều','80g',['Dưa leo','Cơm nóng']),
 row('ga-chien-nuoc-mam','lunch','Gà chiên nước mắm','main','chien','Cánh gà','700g','Tỏi','6 tép','Nước mắm','3 muỗng canh',['Xà lách','Cà chua']),
 row('bo-xao-can-toi','lunch','Bò xào cần tỏi','main','xao','Thịt bò','400g','Cần tây','250g','Tỏi tây','1 cây',['Cơm nóng','Canh nhẹ']),
 row('bo-kho-gung','lunch','Bò kho gừng','main','kho','Thịt bò','500g','Gừng','1 củ','Hành tây','1 củ',['Rau luộc','Cơm nóng']),
 row('bo-xao-thien-ly','lunch','Bò xào hoa thiên lý','main','xao','Thịt bò','400g','Hoa thiên lý','300g','Tỏi','4 tép',['Canh cà chua','Cơm nóng']),
 row('bo-xao-kho-qua','lunch','Bò xào khổ qua','main','xao','Thịt bò','400g','Khổ qua','2 quả','Hành tây','1/2 củ',['Cơm nóng','Trái cây']),
 row('ca-basa-kho-nghe','lunch','Cá basa kho nghệ','main','kho','Cá basa','700g','Nghệ tươi','1 củ','Hành lá','3 nhánh',['Rau luộc','Cơm nóng']),
 row('ca-thu-sot-ca','lunch','Cá thu sốt cà chua','main','sot','Cá thu','600g','Cà chua','4 quả','Hành tây','1/2 củ',['Canh rau','Cơm nóng']),
 row('ca-nuc-kho-thom','lunch','Cá nục kho thơm','main','kho','Cá nục','700g','Dứa','1/2 quả','Cà chua','2 quả',['Rau sống','Cơm nóng']),
 row('ca-loc-kho-tieu','lunch','Cá lóc kho tiêu','main','kho','Cá lóc','700g','Tiêu xanh','2 nhánh','Hành lá','3 nhánh',['Canh chua','Cơm nóng']),
 row('tom-kho-tau','lunch','Tôm kho tàu','main','kho','Tôm sú','600g','Hành lá','3 nhánh','Nước dừa','250ml',['Canh bầu','Cơm nóng']),
 row('tom-rang-me','lunch','Tôm rang me','main','sot','Tôm tươi','600g','Me chín','60g','Rau răm','1 bó nhỏ',['Dưa leo','Cơm nóng']),
 row('muc-xao-dua','lunch','Mực xào dứa','main','xao','Mực tươi','500g','Dứa','1/2 quả','Cần tây','150g',['Cơm nóng','Canh nhẹ']),
 row('muc-xao-can-toi','lunch','Mực xào cần tỏi','main','xao','Mực tươi','500g','Cần tây','250g','Tỏi tây','1 cây',['Cơm nóng','Dưa leo']),
 row('trung-chien-thit-bam','lunch','Trứng chiên thịt băm','main','chien','Trứng gà','5 quả','Thịt heo xay','200g','Hành lá','3 nhánh',['Canh rau','Cơm nóng']),
 row('trung-hap-nam','lunch','Trứng hấp nấm','main','hap','Trứng gà','5 quả','Nấm hương','100g','Thịt heo xay','150g',['Rau luộc','Cơm nóng']),
 row('cha-trung-hap','lunch','Chả trứng hấp','main','hap','Trứng gà','5 quả','Thịt heo xay','250g','Miến dong','50g',['Dưa leo','Cơm nóng']),
 row('dau-hu-sot-thit-bam','lunch','Đậu hũ sốt thịt băm','main','sot','Đậu hũ','5 miếng','Thịt heo xay','250g','Cà chua','3 quả',['Canh cải','Cơm nóng']),
 row('dau-hu-non-hap-thit','lunch','Đậu hũ non hấp thịt','main','hap','Đậu hũ non','3 hộp','Thịt heo xay','250g','Nấm hương','80g',['Rau luộc','Cơm nóng']),
 row('thit-vien-sot-ca','lunch','Thịt viên sốt cà','main','sot','Thịt heo xay','500g','Cà chua','5 quả','Hành tây','1/2 củ',['Xà lách','Cơm nóng']),
 row('cha-la-lot','lunch','Chả lá lốt','main','chien','Thịt heo xay','500g','Lá lốt','30 lá','Hành tím','3 củ',['Bún tươi','Rau sống']),
 row('cha-ca-thac-lac','lunch','Chả cá thác lác chiên','main','chien','Chả cá thác lác','500g','Thì là','1 bó nhỏ','Hành lá','3 nhánh',['Canh cải','Cơm nóng']),
 row('ca-com-kho-tieu','lunch','Cá cơm kho tiêu','main','kho','Cá cơm tươi','500g','Tiêu xanh','2 nhánh','Hành tím','3 củ',['Canh bầu','Cơm nóng']),
 row('thit-luon-mam-nem','lunch','Thịt luộc mắm nêm','main','luoc','Thịt ba chỉ','600g','Dứa','1/3 quả','Mắm nêm','120ml',['Rau sống','Bún tươi']),
 row('ga-luoc-la-chanh','lunch','Gà luộc lá chanh','main','luoc','Gà ta','1 con 1.4kg','Lá chanh','8 lá','Gừng','1 củ',['Rau răm','Cơm nóng']),
 row('ca-dieu-hong-chien-sa','lunch','Cá diêu hồng chiên sả','main','chien','Cá diêu hồng','1 con 900g','Sả','5 cây','Ớt','2 quả',['Xoài xanh','Cơm nóng']),
 row('tom-hap-nuoc-dua','lunch','Tôm hấp nước dừa','main','hap','Tôm sú','700g','Nước dừa','500ml','Sả','4 cây',['Muối tiêu chanh','Rau sống']),
 row('muc-hap-gung','lunch','Mực hấp gừng','main','hap','Mực tươi','600g','Gừng','1 củ','Hành lá','4 nhánh',['Rau răm','Nước chấm gừng']),
 row('heo-quay-kho-cai-chua','lunch','Heo quay kho cải chua','main','kho','Thịt heo quay','600g','Cải chua','400g','Nước dừa','300ml',['Dưa leo','Cơm nóng']),
 row('bo-vien-sot-tieu','lunch','Bò viên sốt tiêu','main','sot','Bò viên','500g','Tiêu xanh','3 nhánh','Hành tây','1 củ',['Khoai tây','Cơm nóng']),
 row('luon-xao-sa-ot','lunch','Lươn xào sả ớt','main','xao','Lươn','600g','Sả','5 cây','Ớt chuông','1 quả',['Dưa leo','Cơm nóng']),
 row('ech-xao-lan','lunch','Ếch xào lăn','main','xao','Thịt ếch','600g','Sả','5 cây','Nước cốt dừa','200ml',['Rau thơm','Cơm nóng']),
];

const dinnerMain=[
 row('thit-kho-dua-cai','dinner','Thịt kho dưa cải','main','kho','Thịt ba chỉ','550g','Cải chua','400g','Hành tím','3 củ',['Canh rau','Cơm nóng']),
 row('thit-kho-cu-cai','dinner','Thịt kho củ cải','main','kho','Thịt nạc vai','550g','Củ cải trắng','500g','Nước dừa','300ml',['Rau luộc','Cơm nóng']),
 row('thit-xao-kim-chi','dinner','Thịt xào kim chi','main','xao','Thịt ba chỉ','450g','Kim chi','350g','Hành tây','1/2 củ',['Canh rong biển','Cơm nóng']),
 row('suon-nuong-sa','dinner','Sườn nướng sả','main','nuong','Sườn cốt lết','4 miếng','Sả','5 cây','Mật ong','2 muỗng canh',['Đồ chua','Cơm nóng']),
 row('suon-nuong-ngu-vi','dinner','Sườn nướng ngũ vị','main','nuong','Sườn non','700g','Hành tím','4 củ','Ngũ vị hương','1 gói',['Xà lách','Cơm nóng']),
 row('suon-hap-dau-den','dinner','Sườn hấp đậu đen','main','hap','Sườn non','650g','Đậu đen lên men','2 muỗng canh','Ớt chuông','1 quả',['Cải thìa','Cơm nóng']),
 row('ga-nuong-la-chanh','dinner','Gà nướng lá chanh','main','nuong','Đùi gà','6 chiếc','Lá chanh','10 lá','Mật ong','2 muỗng canh',['Salad rau','Cơm nóng']),
 row('ga-hap-hanh','dinner','Gà hấp hành','main','hap','Gà ta','1 con 1.4kg','Hành lá','2 bó','Gừng','1 củ',['Rau răm','Muối tiêu chanh']),
 row('ga-om-nam-huong','dinner','Gà om nấm hương','main','om','Thịt gà','700g','Nấm hương','150g','Cà rốt','1 củ',['Cơm nóng','Rau luộc']),
 row('ga-xao-la-que','dinner','Gà xào lá quế','main','xao','Ức gà','500g','Lá quế','1 bó','Ớt chuông','1 quả',['Dưa leo','Cơm nóng']),
 row('bo-sot-vang','dinner','Bò sốt vang','main','om','Bắp bò','700g','Cà rốt','2 củ','Cà chua','4 quả',['Bánh mì','Rau thơm']),
 row('bo-ham-khoai-tay','dinner','Bò hầm khoai tây','main','om','Thịt bò','700g','Khoai tây','4 củ','Cà rốt','2 củ',['Bánh mì','Rau thơm']),
 row('bo-cuon-nam-kim-cham','dinner','Bò cuộn nấm kim châm','main','nuong','Thịt bò lát','500g','Nấm kim châm','300g','Hành lá','3 nhánh',['Salad rau','Cơm nóng']),
 row('bo-nuong-la-lot','dinner','Bò nướng lá lốt','main','nuong','Thịt bò xay','500g','Lá lốt','35 lá','Sả','3 cây',['Bún tươi','Rau sống']),
 row('ca-hoi-ap-chao','dinner','Cá hồi áp chảo','main','chien','Cá hồi','600g','Măng tây','300g','Chanh vàng','1 quả',['Khoai nghiền','Salad']),
 row('ca-chem-hap-xi-dau','dinner','Cá chẽm hấp xì dầu','main','hap','Cá chẽm','1 con 900g','Gừng','1 củ','Hành lá','1 bó',['Cải thìa','Cơm nóng']),
 row('ca-ngu-sot-tieu','dinner','Cá ngừ sốt tiêu','main','sot','Cá ngừ','600g','Tiêu xanh','3 nhánh','Hành tây','1 củ',['Salad rau','Khoai tây']),
 row('ca-keo-kho-rau-ram','dinner','Cá kèo kho rau răm','main','kho','Cá kèo','700g','Rau răm','1 bó','Nước dừa','250ml',['Canh chua','Cơm nóng']),
 row('tom-nuong-muoi-ot','dinner','Tôm nướng muối ớt','main','nuong','Tôm sú','700g','Ớt','3 quả','Tỏi','5 tép',['Rau răm','Dưa leo']),
 row('tom-sot-bo-toi','dinner','Tôm sốt bơ tỏi','main','sot','Tôm sú','650g','Tỏi','8 tép','Bơ lạt','50g',['Bánh mì','Salad']),
 row('muc-nhoi-thit-sot-ca','dinner','Mực nhồi thịt sốt cà','main','sot','Mực ống','600g','Thịt heo xay','300g','Cà chua','4 quả',['Rau luộc','Cơm nóng']),
 row('muc-nuong-sa-te','dinner','Mực nướng sa tế','main','nuong','Mực lá','700g','Sa tế','3 muỗng canh','Sả','4 cây',['Dưa leo','Rau răm']),
 row('ngheu-hap-sa','dinner','Nghêu hấp sả','main','hap','Nghêu','1kg','Sả','6 cây','Rau răm','1 bó',['Nước chấm gừng','Dưa leo']),
 row('oc-buou-nhoi-thit','dinner','Ốc bươu nhồi thịt','main','hap','Ốc bươu','1kg','Thịt heo xay','350g','Sả','6 cây',['Rau răm','Nước mắm gừng']),
 row('trung-cuon-rau-cu','dinner','Trứng cuộn rau củ','main','chien','Trứng gà','6 quả','Cà rốt','1 củ','Đậu Hà Lan','100g',['Canh nấm','Cơm nóng']),
 row('trung-kho-thit','dinner','Trứng kho thịt','main','kho','Trứng gà','6 quả','Thịt ba chỉ','400g','Nước dừa','400ml',['Cải chua','Cơm nóng']),
 row('dau-hu-tay-cam','dinner','Đậu hũ tay cầm','main','om','Đậu hũ','5 miếng','Thịt heo xay','250g','Nấm đông cô','120g',['Cải thìa','Cơm nóng']),
 row('dau-hu-hap-trung-muoi','dinner','Đậu hũ hấp trứng muối','main','hap','Đậu hũ non','3 hộp','Trứng muối','4 quả','Tôm tươi','200g',['Rau luộc','Cơm nóng']),
 row('cha-ca-la-vong','dinner','Chả cá thì là','main','chien','Cá lăng','650g','Thì là','2 bó','Hành lá','1 bó',['Bún tươi','Đậu phộng']),
 row('nem-lui-nuong','dinner','Nem lụi nướng','main','nuong','Thịt heo xay','600g','Sả','12 cây','Đậu phộng','80g',['Bánh tráng','Rau sống']),
 row('thit-nuong-rieng-me','dinner','Thịt nướng riềng mẻ','main','nuong','Thịt nạc vai','650g','Riềng','1 củ','Mẻ','3 muỗng canh',['Bún tươi','Rau sống']),
 row('vit-kho-gung','dinner','Vịt kho gừng','main','kho','Thịt vịt','800g','Gừng','2 củ','Nước dừa','300ml',['Rau luộc','Cơm nóng']),
 row('vit-nau-chao','dinner','Vịt nấu chao','main','om','Thịt vịt','800g','Khoai môn','500g','Chao đỏ','4 viên',['Bún tươi','Rau muống']),
 row('de-xao-lan','dinner','Dê xào lăn','main','xao','Thịt dê','600g','Sả','5 cây','Nước cốt dừa','200ml',['Rau thơm','Bánh mì']),
 row('bo-nhung-giam','dinner','Bò nhúng giấm','main','luoc','Thịt bò lát','700g','Hành tây','2 củ','Giấm gạo','250ml',['Bánh tráng','Rau sống']),
 row('ca-lang-om-chuoi','dinner','Cá lăng om chuối','main','om','Cá lăng','800g','Chuối xanh','4 quả','Đậu hũ','3 miếng',['Bún tươi','Rau tía tô']),
 row('ga-nau-ca-ri','dinner','Cà ri gà','main','om','Thịt gà','800g','Khoai lang','500g','Nước cốt dừa','400ml',['Bánh mì','Rau thơm']),
 row('suon-nau-dau','dinner','Sườn nấu đậu','main','om','Sườn non','700g','Đậu trắng','250g','Cà rốt','2 củ',['Bánh mì','Rau thơm']),
 row('thit-dong','dinner','Thịt đông','main','om','Thịt chân giò','700g','Nấm mèo','100g','Cà rốt','1 củ',['Dưa hành','Cơm nóng']),
 row('ca-kho-mang','dinner','Cá kho măng','main','kho','Cá trắm','700g','Măng tươi','400g','Riềng','1 củ',['Rau luộc','Cơm nóng']),
];

const special=[
 row('canh-rau-ngot-thit-bam','lunch','Canh rau ngót thịt băm','soup','canh','Thịt heo xay','200g','Rau ngót','2 bó','Hành tím','2 củ',['Món mặn','Cơm nóng']),
 row('canh-bi-xanh-tom','lunch','Canh bí xanh nấu tôm','soup','canh','Tôm tươi','250g','Bí xanh','600g','Hành lá','3 nhánh',['Món kho','Cơm nóng']),
 row('canh-mong-toi-muop','lunch','Canh mồng tơi nấu mướp','soup','canh','Tôm khô','50g','Rau mồng tơi','2 bó','Mướp hương','2 quả',['Cà pháo','Cơm nóng']),
 row('rau-muong-xao-toi','lunch','Rau muống xào tỏi','side','xao','Rau muống','2 bó','Tỏi','6 tép','Dầu hào','2 muỗng canh',['Món kho','Cơm nóng']),
 row('kho-quet-rau-luoc','lunch','Kho quẹt rau củ luộc','side','kho','Thịt ba chỉ','200g','Rau củ thập cẩm','800g','Tôm khô','80g',['Cơm nóng','Dưa leo']),
 row('canh-kho-qua-nhoi-thit','dinner','Canh khổ qua nhồi thịt','soup','canh','Thịt heo xay','350g','Khổ qua','4 quả','Nấm mèo','50g',['Món kho','Cơm nóng']),
 row('canh-cai-thit-bam','dinner','Canh cải xanh thịt băm','soup','canh','Thịt heo xay','200g','Cải xanh','2 bó','Gừng','1 nhánh',['Món rang','Cơm nóng']),
 row('canh-bau-nau-ngheu','dinner','Canh bầu nấu nghêu','soup','canh','Nghêu','700g','Bầu','1 quả','Hành lá','3 nhánh',['Món chiên','Cơm nóng']),
 row('ca-tim-nuong-mo-hanh','dinner','Cà tím nướng mỡ hành','side','nuong','Cà tím','4 quả','Hành lá','1 bó','Đậu phộng','80g',['Món mặn','Cơm nóng']),
 row('dua-gia-he','dinner','Dưa giá hẹ','side','tron','Giá đỗ','600g','Hẹ','1 bó','Cà rốt','1 củ',['Thịt kho','Cơm nóng']),
 row('ca-ri-chay','lunch','Cà ri rau củ chay','vegetarian','om','Đậu hũ','4 miếng','Khoai lang','400g','Nước cốt dừa','350ml',['Bánh mì','Rau thơm']),
 row('nam-kho-tieu','lunch','Nấm kho tiêu chay','vegetarian','kho','Nấm đùi gà','500g','Tiêu xanh','3 nhánh','Nước dừa','250ml',['Rau luộc','Cơm nóng']),
 row('rau-cu-xao-chay','lunch','Rau củ xào chay','vegetarian','xao','Đậu hũ','3 miếng','Bông cải xanh','300g','Nấm hương','120g',['Canh chay','Cơm nóng']),
 row('bun-xao-chay','lunch','Bún xào rau củ chay','vegetarian','xao','Bún gạo','500g','Cải thìa','300g','Đậu hũ','3 miếng',['Nước tương','Rau thơm']),
 row('kho-qua-kho-chay','lunch','Khổ qua kho chay','vegetarian','kho','Khổ qua','4 quả','Đậu hũ','4 miếng','Nấm rơm','250g',['Canh rau','Cơm nóng']),
 row('canh-chua-chay','dinner','Canh chua chay','vegetarian','canh','Đậu hũ','4 miếng','Dứa','1/3 quả','Cà chua','3 quả',['Rau muống','Cơm nóng']),
 row('mien-xao-chay','dinner','Miến xào nấm chay','vegetarian','xao','Miến dong','400g','Nấm hương','150g','Cải thìa','300g',['Nước tương','Rau thơm']),
 row('com-chien-chay','dinner','Cơm chiên rau củ chay','vegetarian','rang','Cơm nguội','4 chén','Đậu Hà Lan','150g','Cà rốt','1 củ',['Canh nấm','Dưa leo']),
 row('dau-hu-sa-ot-chay','dinner','Đậu hũ chiên sả ớt','vegetarian','chien','Đậu hũ','5 miếng','Sả','5 cây','Ớt','2 quả',['Rau luộc','Cơm nóng']),
 row('nam-dui-ga-ap-chao','dinner','Nấm đùi gà áp chảo','vegetarian','chien','Nấm đùi gà','600g','Măng tây','250g','Bơ thực vật','40g',['Salad rau','Cơm gạo lứt']),
];

const seeds=[...lunchMain,...dinnerMain,...special];
if(seeds.length!==100)throw new Error(`Expected 100 meals, received ${seeds.length}`);
if(new Set(seeds.map(seed=>seed.id)).size!==100)throw new Error('Duplicate meal id');
if(seeds.filter(seed=>seed.type==='lunch').length!==50||seeds.filter(seed=>seed.type==='dinner').length!==50)throw new Error('Expected 50 lunch and 50 dinner meals');

const category=name=>{
 if(/thịt|sườn|gà|bò|cá|tôm|mực|nghêu|ốc|trứng|vịt|dê|lươn|ếch|chả/i.test(name))return M;
 if(/cơm|bún|miến|bánh mì/i.test(name))return G;
 if(/rau|cải|bí|mồng tơi|mướp|dứa|hành|sả|gừng|cà|nấm|khổ qua|khoai|măng|bầu|giá|hẹ|tỏi|lá|thì là|đậu Hà Lan/i.test(name))return V;
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
 rang:[['Tỏi','4 tép',P],['Nước mắm','2 muỗng canh',P],['Dầu ăn','2 muỗng canh',P]],
 tron:[['Giấm gạo','120ml',P],['Đường','80g',P],['Muối','1 muỗng cà phê',P]],
};
const verbs={kho:'kho',ram:'rim',xao:'xào',chien:'chiên',hap:'hấp',nuong:'nướng',sot:'nấu sốt',om:'om',luoc:'luộc',canh:'nấu canh',rang:'rang',tron:'trộn'};
const stepTemplates=(seed)=>{
 const verb=verbs[seed.method],lower=seed.title.toLocaleLowerCase('vi-VN');
 if(seed.method==='canh')return[
  `Sơ chế ${seed.main.toLocaleLowerCase('vi-VN')} và ${seed.vegetable.toLocaleLowerCase('vi-VN')}; rửa sạch, để ráo rồi cắt vừa ăn.`,
  `Phi thơm hành tím, cho ${seed.main.toLocaleLowerCase('vi-VN')} vào đảo săn và nêm nhẹ.`,
  `Thêm nước, đun sôi rồi cho ${seed.vegetable.toLocaleLowerCase('vi-VN')} cùng ${seed.extra.toLocaleLowerCase('vi-VN')} vào nấu vừa chín.`,
  `Nêm nước mắm vừa ăn, tắt bếp và dùng ${lower} khi còn nóng.`,
 ];
 if(seed.method==='tron')return[
  `Rửa sạch ${seed.main.toLocaleLowerCase('vi-VN')}, ${seed.vegetable.toLocaleLowerCase('vi-VN')} và ${seed.extra.toLocaleLowerCase('vi-VN')}, để thật ráo.`,
  'Đun tan giấm, đường và muối rồi để hỗn hợp nguội hoàn toàn.',
  'Trộn đều nguyên liệu với nước giấm, cho vào hũ sạch và nén nhẹ.',
  `Để ${lower} thấm ít nhất 4 giờ trong ngăn mát trước khi dùng.`,
 ];
 return[
  `Sơ chế ${seed.main.toLocaleLowerCase('vi-VN')}, ${seed.vegetable.toLocaleLowerCase('vi-VN')} và ${seed.extra.toLocaleLowerCase('vi-VN')}; cắt miếng vừa ăn.`,
  `Ướp ${seed.main.toLocaleLowerCase('vi-VN')} với gia vị chính trong 15 phút để thấm đều.`,
  `${verb[0].toLocaleUpperCase('vi-VN')+verb.slice(1)} ${seed.main.toLocaleLowerCase('vi-VN')} đúng độ chín, sau đó thêm ${seed.vegetable.toLocaleLowerCase('vi-VN')} và ${seed.extra.toLocaleLowerCase('vi-VN')}.`,
  `Nêm lại vừa ăn, hoàn thiện ${lower} và dùng nóng cùng ${seed.sides.join(' và ').toLocaleLowerCase('vi-VN')}.`,
 ];
};
const nutritionFor=seed=>{
 const vegetarian=seed.kind==='vegetarian';
 const seafood=/cá|tôm|mực|nghêu|ốc|lươn/i.test(seed.main);
 const soup=seed.kind==='soup';
 return{
  caloriesKcal:soup?150:vegetarian?330:seafood?390:470,
  proteinGrams:soup?14:vegetarian?16:seafood?31:34,
  carbsGrams:soup?12:vegetarian?42:seafood?22:24,
  fatGrams:soup?6:vegetarian?13:seafood?19:27,
  fiberGrams:soup?4:vegetarian?8:seafood?4:3,
  sodiumMg:soup?620:vegetarian?690:seafood?780:850,
  perServing:true,estimateMethod:'editorial_recipe_estimate',
 };
};
const minutes={kho:35,ram:30,xao:20,chien:25,hap:30,nuong:40,sot:30,om:45,luoc:30,canh:25,rang:20,tron:15};
const recipes={};
const meals=seeds.map((seed,index)=>{
 const uniqueIngredients=[
  [seed.main,seed.mainQty,category(seed.main)],
  [seed.vegetable,seed.vegetableQty,category(seed.vegetable)],
  [seed.extra,seed.extraQty,category(seed.extra)],
 ...pantry[seed.method],
 ].filter((item,position,all)=>all.findIndex(other=>other[0].toLocaleLowerCase('vi-VN')===item[0].toLocaleLowerCase('vi-VN'))===position);
 for(const fallback of [['Muối','1/2 muỗng cà phê',P],['Tiêu xay','1/2 muỗng cà phê',P],['Đường','1 muỗng cà phê',P]]){
  if(uniqueIngredients.length>=5)break;
  if(!uniqueIngredients.some(item=>item[0]===fallback[0]))uniqueIngredients.push(fallback);
 }
 recipes[seed.id]={
  ingredients:uniqueIngredients.map(([name,quantity,ingredientCategory],ingredientIndex)=>({
   name,quantity,category:ingredientCategory,preparation:ingredientIndex<3?'Sơ chế theo bước 1':undefined,
   substitutions:ingredientIndex===0&&seed.kind==='vegetarian'?[{name:'Đậu hũ',ratio:'1:1',note:'Chọn đậu hũ chắc để giữ hình dạng'}]:[],
  })),
  steps:stepTemplates(seed),
 };
 const tags=['home-cooked',seed.kind,seed.method,seed.type,seed.kind==='vegetarian'?'vegetarian':'family'];
 return{
  id:seed.id,slug:seed.id,type:seed.type,title:seed.title,
  summary:`Món ${seed.kind==='vegetarian'?'chay ':''}${seed.title.toLocaleLowerCase('vi-VN')} phù hợp cho bữa ${seed.type==='lunch'?'trưa':'tối'} gia đình.`,
  sideDishes:seed.sides,cookingTimeMinutes:minutes[seed.method]+(index%3)*5,
  estimatedCost:seed.kind==='vegetarian'?90000:/bò|cá hồi|tôm sú|mực|dê/i.test(seed.main)?190000:140000,
  servings:4,missingIngredients:[seed.vegetable],status:'unconfirmed',
  cuisine:'vietnamese',difficulty:minutes[seed.method]>=40?'medium':'easy',
  tags,nutrition:nutritionFor(seed),mealSource:'home_cooked',
 };
});

const output={version:1,generatedAt:'2026-07-28',meals,recipes};
mkdirSync(resolve('content'),{recursive:true});
writeFileSync(resolve('content/home-cooked-expansion.json'),`${JSON.stringify(output,null,2)}\n`,'utf8');
const imageLines=meals.map(meal=>` '${meal.id}':require('../assets/images/meals/home-cooked-v2/${meal.id}.webp'),`).join('\n');
const moduleSource=`// Generated by scripts/catalog/generate-home-cooked-expansion.mjs.
// Edit the generator source, then regenerate this module and the canonical JSON.
import {Meal,RecipeData} from './types';
import catalog from '../content/home-cooked-expansion.json';

const images:Record<string,Meal['image']>={
${imageLines}
};

export const expandedHomeCookedMeals:Meal[]=catalog.meals.map(meal=>({
 ...meal,
 image:images[meal.id],
 type:meal.type as Meal['type'],
 status:meal.status as Meal['status'],
 difficulty:meal.difficulty as Meal['difficulty'],
 mealSource:'home_cooked',
}));

export const expandedHomeCookedRecipes:Record<string,RecipeData>=Object.fromEntries(
 Object.entries(catalog.recipes).map(([mealId,recipe])=>[
  mealId,
  {
   mealId,
   ingredients:recipe.ingredients.map((item,index)=>({
    ...item,
    id:\`\${mealId}-ingredient-\${index+1}\`,
    available:false,
    substitutions:item.substitutions.map((option,substitutionIndex)=>({
     ...option,
     id:\`\${mealId}-ingredient-\${index+1}-substitution-\${substitutionIndex+1}\`,
    })),
   })),
   steps:recipe.steps.map((description,index)=>({
    id:\`\${mealId}-step-\${index+1}\`,
    order:index+1,
    description,
   })),
  },
 ]),
);
`;
writeFileSync(resolve('src/home-cooked-expansion.ts'),moduleSource,'utf8');
console.log(JSON.stringify({
 meals:meals.length,lunch:meals.filter(meal=>meal.type==='lunch').length,
 dinner:meals.filter(meal=>meal.type==='dinner').length,
 soupsAndSides:meals.filter(meal=>meal.tags.includes('soup')||meal.tags.includes('side')).length,
 vegetarian:meals.filter(meal=>meal.tags.includes('vegetarian')).length,
 ingredients:Object.values(recipes).reduce((sum,recipe)=>sum+recipe.ingredients.length,0),
 steps:Object.values(recipes).reduce((sum,recipe)=>sum+recipe.steps.length,0),
}));
