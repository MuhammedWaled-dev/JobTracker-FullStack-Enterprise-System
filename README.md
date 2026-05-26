\# 💼 JobTracker: Full-Stack Enterprise Application




!\[React]

!\[ASP.NET Core]

!\[Entity Framework Core]

!\[Material UI]

!\[Docker]



\---



\### 🇹🇷 Proje Özeti

\*\*JobTracker\*\*, iş başvuru süreçlerini uçtan uca yönetmek için tasarlanmış, kurumsal standartlarda bir Full-Stack platformdur. Proje, modern bir React arayüzünü, katmanlı mimari (N-Tier) üzerine kurulu güçlü bir ASP.NET Core API ile birleştirir. Tüm altyapı Docker üzerinde konteynerize edilmiştir.



\*\*Anahtar Özellikler:\*\*

\- \*\*Gelişmiş Dashboard:\*\* Başvuru istatistiklerini ve süreçlerini analiz eden veri odaklı merkezi panel.

\- \*\*Güvenlik \& Yetkilendirme:\*\* JWT (JSON Web Token) entegrasyonu ile Admin ve User rolleri için `\[Authorize]` tabanlı Role-Based Access Control (RBAC).

\- \*\*Veri Yönetimi:\*\* Entity Framework Core (EF Core) kullanılarak Code-First yaklaşımı ve otomatik Migration yönetimi.

\- \*\*Modern UI/UX:\*\* Material UI bileşenleri ile geliştirilmiş, tamamen duyarlı (Responsive) arayüz.

\- \*\*Konteynerleştirme:\*\* Docker ve Docker-Compose ile API, Frontend ve SQL Server'ın tek komutla ayağa kaldırılması.



\### 🇬🇧 Project Overview

\*\*JobTracker\*\* is an enterprise-grade solution designed to manage job application lifecycles. It demonstrates a sophisticated integration between a React frontend and a robust ASP.NET Core API, following clean code principles and N-Tier architecture.



\*\*Core Features:\*\*

\- \*\*Data-Driven Dashboard:\*\* A comprehensive UI for tracking and analyzing application metrics.

\- \*\*Security:\*\* Secure authentication via JWT, featuring Role-Based Access Control (RBAC) for Admin and User identities.

\- \*\*ORM Integration:\*\* Database management powered by Entity Framework Core (EF Core) with automated migrations.

\- \*\*Modern UI:\*\* Aesthetic and functional interface built with Material UI (MUI).

\- \*\*DevOps Ready:\*\* Fully containerized architecture using Docker Compose.



\---



\## 🏗️ Architecture \& Tech Stack



\### \*\*Backend (ASP.NET Core API)\*\*

\- \*\*N-Tier Architecture:\*\* Dağıtık sorumluluk ilkesine dayalı katmanlı yapı:

&#x20;   - `JobTracker.API`: Presentation \& Controllers.

&#x20;   - `JobTracker.Business`: Logic \& Validation rules.

&#x20;   - `JobTracker.DataAccess`: EF Core DB Context \& Repositories.

&#x20;   - `JobTracker.Models`: Data Transfer Objects (DTOs) \& Entities.

\- \*\*ORM:\*\* Entity Framework Core (SQL Server).

\- \*\*Auth:\*\* JWT Bearer Token.



\### \*\*Frontend (React)\*\*

\- \*\*Framework:\*\* React.js (Powered by Vite).

\- \*\*UI Framework:\*\* Material UI (MUI).

\- \*\*State Management:\*\* Axios for API communication.



\---



\## 🚀 Hızlı Kurulum (Docker)



Sistemi (Frontend, API ve SQL Server) Docker üzerinde anında çalıştırmak için:


```bash

docker-compose up --build

Not: EF Core Migrations sayesinde, konteynerler ilk çalıştığında veritabanı şeması otomatik olarak oluşturulur.
