with ready_made_images(id,image_path) as(values
 ('buy-pho-bo','ready-made/buy-pho-bo.webp'),
 ('buy-banh-mi-thit','ready-made/buy-banh-mi-thit.webp'),
 ('buy-bun-bo','ready-made/buy-bun-bo.webp'),
 ('buy-hu-tieu','ready-made/buy-hu-tieu.webp'),
 ('buy-com-tam','ready-made/buy-com-tam.webp'),
 ('buy-xoi-man','ready-made/buy-xoi-man.webp'),
 ('buy-banh-cuon','ready-made/buy-banh-cuon.webp'),
 ('buy-chao-long','ready-made/buy-chao-long.webp'),
 ('buy-banh-uot','ready-made/buy-banh-uot.webp'),
 ('buy-banh-bao','ready-made/buy-banh-bao.webp'),
 ('buy-banh-gio','ready-made/buy-banh-gio.webp'),
 ('buy-bo-kho','ready-made/buy-bo-kho.webp'),
 ('buy-mi-quang','ready-made/buy-mi-quang.webp'),
 ('buy-bun-rieu','ready-made/buy-bun-rieu.webp'),
 ('buy-banh-canh','ready-made/buy-banh-canh.webp'),
 ('buy-mi-hoanh-thanh','ready-made/buy-mi-hoanh-thanh.webp'),
 ('buy-bun-thit-nuong','ready-made/buy-bun-thit-nuong.webp'),
 ('buy-xoi-ga','ready-made/buy-xoi-ga.webp'),
 ('buy-banh-khot','ready-made/buy-banh-khot.webp'),
 ('buy-yogurt-fruit','ready-made/buy-yogurt-fruit.webp')
)
update public.meals as meal
set image_path=ready_made_images.image_path,
    image_url=null,
    content_version=greatest(meal.content_version,2),
    updated_at=now()
from ready_made_images
where meal.id=ready_made_images.id
  and meal.meal_source='ready_made';
