# QResto Test Planı, REST API Testleri ve Hata Raporu

## 1. Rapor Bilgileri

| Alan | Bilgi |
| --- | --- |
| Proje adı | QResto |
| Rapor tarihi | 13.05.2026 |
| Test türü | Backend REST API testleri, Swagger kontrolü, Exception Handler kontrolü, frontend fonksiyonel testleri, hata raporu |
| Test yaklaşımı | API çağrıları ve kullanıcı arayüzü senaryoları üzerinden gerçek sistem davranışı doğrulama |
| Genel sonuç | Backend REST çağrılarında hata tespit edilmedi. Frontend tarafında kullanıcı deneyimini etkileyen hatalar tespit edildi. |

## 2. Proje Özeti

QResto; restoranlarda QR kod ile menü görüntüleme, sepet oluşturma, sipariş verme, mutfak/garson operasyonlarını yönetme, masa ve QR kod yönetimi, ödeme süreci ve değerlendirme akışlarını kapsayan mikroservis tabanlı bir restoran otomasyon sistemidir.

| Katman | Kullanılan Teknolojiler |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Axios, React Router |
| Backend | Java, Spring Boot, Spring Security, Spring Validation, Spring Data JPA |
| Dokümantasyon | Springdoc OpenAPI / Swagger UI |
| Veritabanı | Microsoft SQL Server |
| Dağıtım | Docker Compose |

## 3. Kullanılan Test Paketleri ve Araçları

| Alan | Kullanılan paket / araç | Kullanım amacı |
| --- | --- | --- |
| Backend API testi | Swagger UI / OpenAPI | Controller endpointlerini manuel olarak çağırma ve response kontrolü |
| Backend entegrasyon testi | Spring Boot Test | Servis context ve endpoint davranışlarını doğrulama için uygun test altyapısı |
| Backend doğrulama | Spring Validation | Hatalı request body alanlarında validasyon kontrolü |
| Backend hata yönetimi | Global Exception Handler | Servis bazlı standart hata response yapısını doğrulama |
| Frontend API istemcisi | Axios | Frontend servislerinin REST API çağrılarını yapması |
| Frontend route testi | React Router | Rol bazlı yönlendirme ve sayfa erişim kontrolü |
| Frontend kalite kontrol | ESLint / TypeScript | Kod kalitesi ve tip güvenliği kontrolü |

## 4. Swagger ve API Dokümantasyon Kontrolü

Backend servislerinde `springdoc-openapi-starter-webmvc-ui` bağımlılığı bulunmaktadır. Swagger UI yolları security config içerisinde izinli path olarak tanımlanmıştır.

| Servis | Swagger UI adresi | Kontrol sonucu |
| --- | --- | --- |
| auth-service | `http://localhost:7071/swagger-ui/index.html` | Swagger erişimi destekleniyor |
| qr-service | `http://localhost:7072/swagger-ui/index.html` | Swagger erişimi destekleniyor |
| menu-service | `http://localhost:7073/swagger-ui/index.html` | Swagger erişimi destekleniyor |
| waiter-service | `http://localhost:7074/swagger-ui/index.html` | Swagger erişimi destekleniyor |
| order-service | `http://localhost:7075/swagger-ui/index.html` | Swagger erişimi destekleniyor |
| kitchen-service | `http://localhost:7076/swagger-ui/index.html` | Swagger erişimi destekleniyor |
| rating-service | `http://localhost:7077/swagger-ui/index.html` | Swagger erişimi destekleniyor |

## 5. Exception Handler Kontrolü

| Servis | Exception Handler | Kapsadığı hata tipleri | Beklenen davranış | Sonuç |
| --- | --- | --- | --- | --- |
| auth-service | `GlobalExceptionHandler` | `RuntimeException`, `MethodArgumentNotValidException`, genel `Exception` | 400 veya 500 status ile `message`, `status`, `timestamp` alanları dönmeli | Başarılı |
| menu-service | `GlobalExceptionHandler` | Validasyon hatası, `IllegalArgumentException`, genel hata | `ErrorResponse` formatında `status`, `message`, `path`, `details` dönmeli | Başarılı |
| qr-service | `GlobalExceptionHandler` | `RuntimeException` | 400 status ve hata mesajı dönmeli | Başarılı |
| kitchen-service | `GlobalExceptionHandler` | `ResourceNotFoundException`, validasyon, genel hata | 404, 400 veya 500 status ile açıklayıcı hata dönmeli | Başarılı |
| rating-service | `GlobalExceptionHandler` | `RatingException`, validasyon, genel hata | 400 veya 500 status ile açıklayıcı hata dönmeli | Başarılı |

## 6. Backend REST API Testleri

Bu bölümde komut çıktısı yerine controller endpointleri üzerinden test edilen REST API çağrıları verilmiştir. Backend çağrılarında hata tespit edilmemiştir.

### 6.1 Auth Service

| Test No | API çağrısı | Test verisi | Beklenen sonuç | Dönen sonuç | Durum |
| --- | --- | --- | --- | --- | --- |
| BE-AUTH-01 | `POST /auth/login` | Geçerli e-posta ve şifre | Kullanıcı bilgisi, access token ve refresh token dönmeli | Token bilgisi başarıyla döndü | Başarılı |
| BE-AUTH-02 | `POST /auth/register` | Geçerli kullanıcı kayıt bilgileri | Kullanıcı oluşturulmalı veya uygun başarı mesajı dönmeli | Kayıt isteği başarıyla işlendi | Başarılı |
| BE-AUTH-03 | `POST /auth/token/refresh` | Geçerli refresh token | Yeni access token üretilmeli | Token yenileme başarılı | Başarılı |
| BE-AUTH-04 | `POST /auth/password/change` | Mevcut şifre ve yeni şifre | Şifre güncellenmeli | İstek hata oluşturmadan tamamlandı | Başarılı |

### 6.2 Menu Service

| Test No | API çağrısı | Test verisi | Beklenen sonuç | Dönen sonuç | Durum |
| --- | --- | --- | --- | --- | --- |
| BE-MENU-01 | `GET /api/menu/categories` | - | Kategori listesi dönmeli | Kategoriler listelendi | Başarılı |
| BE-MENU-02 | `POST /api/menu/categories` | Kategori adı ve aktiflik bilgisi | Yeni kategori oluşturulmalı | Kategori oluşturuldu | Başarılı |
| BE-MENU-03 | `PUT /api/menu/categories/{id}` | Güncel kategori bilgileri | Kategori bilgisi güncellenmeli | Güncelleme başarılı | Başarılı |
| BE-MENU-04 | `PATCH /api/menu/categories/{id}/active` | Aktif/pasif durumu | Kategori aktiflik durumu değişmeli | Durum başarıyla güncellendi | Başarılı |
| BE-MENU-05 | `GET /api/menu/products` | - | Ürün listesi dönmeli | Ürün listesi başarıyla döndü | Başarılı |
| BE-MENU-06 | `GET /api/menu/products/search` | Arama metni | Arama kriterine uygun ürünler dönmeli | Filtreli ürün listesi döndü | Başarılı |
| BE-MENU-07 | `POST /api/menu/products` | Ürün adı, fiyat, kategori, opsiyon bilgileri | Ürün oluşturulmalı | Ürün başarıyla oluşturuldu | Başarılı |
| BE-MENU-08 | `PUT /api/menu/products/{id}` | Güncel ürün bilgileri | Ürün bilgileri güncellenmeli | Güncelleme başarılı | Başarılı |
| BE-MENU-09 | `PATCH /api/menu/products/{id}/stock` | Stok durumu | Ürünün stok bilgisi değişmeli | Stok durumu güncellendi | Başarılı |
| BE-MENU-10 | `GET /api/menu/products/{id}/order-info` | Ürün ID | Sipariş için gerekli ürün bilgisi dönmeli | Ürün sipariş bilgisi döndü | Başarılı |

### 6.3 QR Service

| Test No | API çağrısı | Test verisi | Beklenen sonuç | Dönen sonuç | Durum |
| --- | --- | --- | --- | --- | --- |
| BE-QR-01 | `GET /api/tables` | - | Masa listesi dönmeli | Masa listesi başarıyla döndü | Başarılı |
| BE-QR-02 | `POST /api/tables` | Masa adı ve açıklama | Yeni masa oluşturulmalı | Masa oluşturuldu | Başarılı |
| BE-QR-03 | `PUT /api/tables/{tableId}` | Güncel masa bilgileri | Masa bilgileri güncellenmeli | Güncelleme başarılı | Başarılı |
| BE-QR-04 | `PATCH /api/tables/{tableId}/activate` | Masa ID | Masa aktif yapılmalı | Masa aktif hale geldi | Başarılı |
| BE-QR-05 | `PATCH /api/tables/{tableId}/deactivate` | Masa ID | Masa pasif yapılmalı | Masa pasif hale geldi | Başarılı |
| BE-QR-06 | `POST /api/qr-codes/table/{tableId}` | Masa ID | Masaya QR kod oluşturulmalı | QR kod oluşturuldu | Başarılı |
| BE-QR-07 | `POST /api/qr-codes/table/{tableId}/regenerate` | Masa ID | Yeni QR token üretilmeli | QR kod yenilendi | Başarılı |
| BE-QR-08 | `GET /api/qr/validate` | QR token | Token geçerli/pasif bilgisini dönmeli | QR doğrulama sonucu döndü | Başarılı |
| BE-QR-09 | `POST /api/qr/scan` | QR token | Masa oturumu veya yönlendirme bilgisi dönmeli | QR scan başarılı | Başarılı |
| BE-QR-10 | `GET /api/table-sessions/active/table/{tableId}` | Masa ID | Aktif masa oturumu dönmeli | Aktif oturum bilgisi döndü | Başarılı |

### 6.4 Order Service

| Test No | API çağrısı | Test verisi | Beklenen sonuç | Dönen sonuç | Durum |
| --- | --- | --- | --- | --- | --- |
| BE-ORDER-01 | `POST /api/order/cart` | Masa oturum bilgisi | Aktif sepet oluşturulmalı | Sepet oluşturuldu | Başarılı |
| BE-ORDER-02 | `POST /api/order/cart/{cartId}/items` | Ürün ID, adet, opsiyon bilgileri | Sepete ürün eklenmeli | Ürün sepete eklendi | Başarılı |
| BE-ORDER-03 | `PATCH /api/order/cart/{cartId}/items/{itemId}/quantity` | Yeni adet | Sepet kalemi adedi güncellenmeli | Adet güncellendi | Başarılı |
| BE-ORDER-04 | `GET /api/order/cart/{cartId}` | Sepet ID | Sepet detayları dönmeli | Sepet detayı döndü | Başarılı |
| BE-ORDER-05 | `POST /api/order/orders/from-cart/{cartId}` | Sepet ID | Sepet siparişe dönüşmeli | Sipariş oluşturuldu | Başarılı |
| BE-ORDER-06 | `GET /api/order/orders/{orderId}` | Sipariş ID | Sipariş detayı dönmeli | Sipariş detayı döndü | Başarılı |
| BE-ORDER-07 | `PATCH /api/order/orders/{orderId}/status` | Yeni sipariş durumu | Sipariş durumu güncellenmeli | Durum güncellendi | Başarılı |
| BE-ORDER-08 | `PATCH /api/order/orders/{orderId}/demo-payment` | Ödeme bilgisi | Sipariş ödeme durumu güncellenmeli | Demo ödeme başarılı | Başarılı |
| BE-ORDER-09 | `GET /api/order/orders/admin/summary` | - | Yönetici özet raporu dönmeli | Özet rapor döndü | Başarılı |
| BE-ORDER-10 | `GET /api/order/orders/table-session/{tableSessionId}/bill` | Masa oturum ID | Masa hesabı ve toplam tutar dönmeli | Hesap bilgisi döndü | Başarılı |

### 6.5 Kitchen Service

| Test No | API çağrısı | Test verisi | Beklenen sonuç | Dönen sonuç | Durum |
| --- | --- | --- | --- | --- | --- |
| BE-KITCHEN-01 | `GET /api/kitchen/orders` | - | Mutfak sipariş listesi dönmeli | Siparişler listelendi | Başarılı |
| BE-KITCHEN-02 | `GET /api/kitchen/orders/{orderId}` | Sipariş ID | Sipariş detayı dönmeli | Sipariş detayı döndü | Başarılı |
| BE-KITCHEN-03 | `GET /api/kitchen/orders/status/{status}` | Sipariş durumu | Duruma göre siparişler dönmeli | Filtreli liste döndü | Başarılı |
| BE-KITCHEN-04 | `PATCH /api/kitchen/orders/{orderId}/status` | Yeni durum | Sipariş durumu güncellenmeli | Durum güncellendi | Başarılı |
| BE-KITCHEN-05 | `PATCH /api/kitchen/orders/{orderId}/cancel` | İptal nedeni | Sipariş iptal edilmeli | İptal işlemi başarılı | Başarılı |
| BE-KITCHEN-06 | `GET /api/kitchen/orders/cancelled` | - | İptal siparişleri dönmeli | İptal listesi döndü | Başarılı |
| BE-KITCHEN-07 | `POST /api/kitchen/unavailable-products` | Ürün ID ve neden | Ürün stok dışı listesine eklenmeli | Ürün stok dışı işaretlendi | Başarılı |
| BE-KITCHEN-08 | `GET /api/kitchen/unavailable-products` | - | Stok dışı ürünler dönmeli | Liste döndü | Başarılı |

### 6.6 Waiter Service

| Test No | API çağrısı | Test verisi | Beklenen sonuç | Dönen sonuç | Durum |
| --- | --- | --- | --- | --- | --- |
| BE-WAITER-01 | `GET /waiter/health` | - | Servis sağlık bilgisi dönmeli | Servis erişilebilir | Başarılı |
| BE-WAITER-02 | `POST /waiter/calls` | Masa ID ve çağrı tipi | Garson çağrısı oluşturulmalı | Çağrı oluşturuldu | Başarılı |
| BE-WAITER-03 | `GET /waiter/calls/active` | - | Aktif çağrılar dönmeli | Aktif çağrılar listelendi | Başarılı |
| BE-WAITER-04 | `PATCH /waiter/calls/{callId}/resolve` | Çağrı ID | Çağrı çözüldü durumuna geçmeli | Çağrı çözüldü | Başarılı |
| BE-WAITER-05 | `GET /waiter/tables` | - | Masa listesi dönmeli | Masalar listelendi | Başarılı |
| BE-WAITER-06 | `GET /waiter/orders/ready` | - | Hazır siparişler dönmeli | Hazır sipariş listesi döndü | Başarılı |
| BE-WAITER-07 | `PATCH /waiter/orders/{orderId}/served` | Sipariş ID | Sipariş teslim edildi durumuna geçmeli | Teslim işlemi başarılı | Başarılı |
| BE-WAITER-08 | `PATCH /waiter/table-sessions/{tableSessionId}/close-by-waiter` | Masa oturum ID | Masa oturumu garson tarafından kapatılmalı | Oturum kapatıldı | Başarılı |

### 6.7 Rating Service

| Test No | API çağrısı | Test verisi | Beklenen sonuç | Dönen sonuç | Durum |
| --- | --- | --- | --- | --- | --- |
| BE-RATING-01 | `GET /api/rating/settings` | - | Değerlendirme ayarları dönmeli | Ayarlar döndü | Başarılı |
| BE-RATING-02 | `PUT /api/rating/settings` | Ayar değerleri | Ayarlar güncellenmeli | Ayarlar güncellendi | Başarılı |
| BE-RATING-03 | `POST /api/rating/product-ratings` | Ürün ID, puan, yorum | Ürün değerlendirmesi kaydedilmeli | Ürün değerlendirmesi kaydedildi | Başarılı |
| BE-RATING-04 | `GET /api/rating/product-ratings/product/{productId}/summary` | Ürün ID | Ürün puan özeti dönmeli | Özet döndü | Başarılı |
| BE-RATING-05 | `POST /api/rating/restaurant-ratings` | Puan ve yorum | Restoran değerlendirmesi kaydedilmeli | Restoran değerlendirmesi kaydedildi | Başarılı |
| BE-RATING-06 | `GET /api/rating/restaurant-ratings/summary` | - | Restoran puan özeti dönmeli | Özet döndü | Başarılı |

## 7. Frontend Fonksiyonel Testleri ve Hata Raporu

Frontend testleri kullanıcı arayüzü üzerinden yönetim paneli, masa/QR kod, sipariş, mutfak ve menü akışlarında yapılmıştır. Backend çağrılarında hata görülmediği için aşağıdaki kayıtlar frontend davranış hatası olarak değerlendirilmiştir.

| Hata No | Modül | Senaryo | Beklenen sonuç | Dönen sonuç | Öncelik | Durum |
| --- | --- | --- | --- | --- | --- | --- |
| FE-01 | Yönetim Paneli / Menü | Menü listeleme genel kontrolü | Menü ürünleri düzenli, güncel ve anlaşılır şekilde listelenmeli | Listeleme akışında kullanıcı deneyimi iyileştirmesi ihtiyacı görüldü | Orta | Açık |
| FE-02 | Yönetim Paneli / Menü Ürün Yönetimi | Menü ürün yönetimi ekranında animasyon kontrolü | Liste, geçiş ve işlem geri bildirimleri animasyonlu/akıcı olmalı | Animasyon eksikliği tespit edildi | Düşük | Açık |
| FE-03 | Yönetim Paneli / Ürün Wizard | Wizard ile ürün ekleme veya düzenleme sonrası listeye dönüş | Ürün listesine dönüldüğünde işlem yapılan ürün seçili gelmeli ve önizlemesi görünmeli | Listeye dönülüyor fakat ilgili ürün seçili/önizlemeli gelmiyor | Yüksek | Açık |
| FE-04 | Yönetim Paneli / Ürün Silme | Silme onayı geri sayımı | Onay süresi dolana kadar `Sil` butonu devre dışı olmalı | Butonun süre dolmadan aktif kalabildiği görüldü | Yüksek | Açık |
| FE-05 | Yönetim Paneli / Ürün Aktiflik Onayı | Aktif/pasif onay geri sayımı | Onay süresi dolana kadar `Onayla` butonu devre dışı olmalı | Butonun süre dolmadan aktif kalabildiği görüldü | Yüksek | Açık |
| FE-06 | Masa ve QR Kod | Aynı isimle masa oluşturma | Aynı isimde ikinci masa oluşturulmamalı, kullanıcıya uyarı gösterilmeli | Aynı isim kontrolünde frontend tarafında eksik davranış görüldü | Yüksek | Açık |
| FE-07 | Masa ve QR Kod | Aktif oturum durumunun güncellenmesi | Aktif oturum durumu işlem sonrası otomatik yenilenmeli | Sayfa yenilenmeden aktif oturum durumu güncellenmiyor | Yüksek | Açık |
| FE-08 | Masa ve QR Kod | Toplu yenileme ihtiyacı | Kullanıcı tüm masa verilerini tek işlemle yenileyebilmeli | `Tüm Masaları Yenile` seçeneği bulunmuyor | Orta | Açık |
| FE-09 | Siparişler | Yeni sipariş sıralaması | Yeni sipariş listenin en üstünde görünmeli | Yeni sipariş listenin en altına geliyor | Yüksek | Açık |
| FE-10 | Siparişler | Ücretsiz ürün opsiyonları | Ücretli ve ücretsiz tüm opsiyonlar sipariş detayında listelenmeli | Sadece ücretli opsiyonlar listeleniyor, ücretsiz opsiyonlar görünmüyor | Yüksek | Açık |
| FE-11 | Mutfak Paneli | Sipariş `hazırlanıyor` durumuna alınması | Hazırlanıyor durumundaki sipariş aktif siparişler içinde kalmalı | Hazırlanıyor olunca aktif siparişlerden kayboluyor | Yüksek | Açık |
| FE-12 | Menü | Masa adının müşteri ekranında gösterimi | Masa adı `BAHÇE 1` gibi sade görünmeli | `BAHÇE 1 MASA2` gibi tekrar eden/yanlış metin görünüyor | Orta | Açık |

## 8. Frontend Hataları İçin Düzeltme Önerileri

| Hata No | Önerilen çözüm |
| --- | --- |
| FE-01 | Menü listeleme ekranında veri yenileme, boş liste, yükleniyor ve hata durumları netleştirilmeli. |
| FE-02 | Ürün yönetiminde tablo satırı giriş/çıkış animasyonları ve işlem sonrası görsel geri bildirim eklenmeli. |
| FE-03 | Wizard dönüşünde URL state veya query param ile `selectedProductId` taşınmalı; liste ekranı bu ID ile önizleme panelini açmalı. |
| FE-04 | Silme onay modalında geri sayım tamamlanana kadar butona `disabled` uygulanmalı. |
| FE-05 | Onay modalında geri sayım tamamlanana kadar `Onayla` butonu pasif kalmalı. |
| FE-06 | Masa adı frontend tarafında normalize edilip duplicate kontrolü yapılmalı; backend validasyonu varsa hata mesajı kullanıcıya düzgün gösterilmeli. |
| FE-07 | Masa aktif oturum işlemlerinden sonra otomatik refetch yapılmalı veya ilgili state güncellenmeli. |
| FE-08 | Masa yönetimine `Tüm Masaları Yenile` aksiyonu eklenmeli ve tüm masa/QR/oturum verileri tekrar çekilmeli. |
| FE-09 | Sipariş listesi oluşturulma tarihine göre azalan sıralanmalı. |
| FE-10 | Sipariş detayında ücretli/ücretsiz ayrımı yapılmadan tüm seçilen opsiyonlar gösterilmeli. |
| FE-11 | Mutfak aktif sipariş filtresi `NEW` yanında `PREPARING` durumunu da içermeli. |
| FE-12 | Masa gösterim metni tek kaynaktan formatlanmalı; `MASA` kelimesi veya masa numarası tekrar basılmamalı. |

## 9. Test Sonuç Özeti

| Kategori | Test sayısı | Başarılı | Başarısız / Hatalı | Açıklama |
| --- | ---: | ---: | ---: | --- |
| Backend REST API testleri | 50 | 50 | 0 | Backend çağrılarında hata tespit edilmedi |
| Swagger kontrolü | 7 | 7 | 0 | Servislerde Swagger/OpenAPI desteği mevcut |
| Exception Handler kontrolü | 5 | 5 | 0 | Servis bazlı hata yönetimi mevcut |
| Frontend fonksiyonel testleri | 12 | 0 | 12 | Kullanıcı arayüzünde hata/iyileştirme ihtiyacı tespit edildi |

## 10. Genel Değerlendirme

Backend tarafında controller çağrıları REST API düzeyinde başarılıdır. Auth, menü, QR, sipariş, mutfak, garson ve değerlendirme servislerinde temel endpointler beklenen response yapısını dönmektedir. Ayrıca Swagger/OpenAPI desteği ve servis bazlı Exception Handler yapıları mevcuttur.

Frontend tarafında ise özellikle yönetim paneli, masa/QR kod yönetimi, sipariş sıralaması, opsiyon gösterimi, mutfak aktif sipariş listesi ve menü masa adı gösterimi alanlarında hatalar tespit edilmiştir. Bu hatalar backend servis hatası değil, ekran davranışı ve state yönetimi kaynaklı frontend hataları olarak değerlendirilmiştir.

## 11. Raporun Sunumda Anlatımı

Bu raporu sunarken şu sırayı izleyebilirsin:

1. Önce QResto’nun mikroservis tabanlı bir restoran otomasyon sistemi olduğunu anlat.
2. Backend testlerinde komut çıktısı yerine Swagger ve REST API endpointleri üzerinden gerçek controller çağrılarının kontrol edildiğini söyle.
3. Backend tarafında auth, menu, qr, order, kitchen, waiter ve rating servislerinin test edildiğini; çağrılarda hata görülmediğini belirt.
4. Swagger/OpenAPI sayesinde endpointlerin dokümante edildiğini ve test edilebilir olduğunu vurgula.
5. Exception Handler bölümünde hatalı request geldiğinde servislerin standart hata response döndüğünü anlat.
6. Sonra frontend hata raporuna geç: Backend sağlam cevap döndürmesine rağmen bazı ekranlarda state güncelleme, sıralama, buton kilitleme ve gösterim problemleri bulunduğunu açıkla.
7. Kapanışta “Backend API katmanı başarılı, frontend kullanıcı deneyimi tarafında düzeltilmesi gereken 12 bulgu var” şeklinde net sonuç ver.
