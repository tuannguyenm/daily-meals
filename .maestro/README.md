# Daily Meals native E2E

Các flow này chạy trên Android emulator với development build
`com.dailymeals.family`. Metro phải được mở ở cổng `8081`; địa chỉ
`10.0.2.2` cho phép emulator truy cập máy Windows host.

## Chạy smoke flow

```powershell
npm run start:e2e
```

Mở một terminal khác:

```powershell
maestro test .maestro/onboarding-ai-shopping.yaml
maestro test .maestro/recipe-cooking.yaml
```

Flow đầu tiên xóa dữ liệu app, hoàn thành onboarding, chờ gợi ý AI/rule,
chọn món, mở công thức và thêm nguyên liệu vào danh sách mua sắm. Flow thứ
hai kiểm tra Cooking Mode từ công thức đến trạng thái hoàn thành.

Nếu dùng APK preview/release thay vì development build, xóa bước `openLink`
đầu tiên khỏi bản sao của flow onboarding.
