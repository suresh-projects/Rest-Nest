🪺 RestNest

Hourly home rest rooms for travelling families in Chennai.

Travelling with family and just need a few hours to freshen up, feed the baby or rest? A full-day hotel room costs ₹1000+. RestNest lets homeowners (hosts) rent a spare room by the hour (₹300-500) with their own house rules (no alcohol, no smoking, family only), and lets guests book it near their railway or bus station.

🔗 Live demo: https://rest-nest-navy.vercel.app/login 

✨ Features

For guests

Search rooms by area, nearby station / bus stand (Central, Egmore, Koyambedu, Airport...), price, guests, amenities and house rules
Pick a date, duration and start time from a live slot picker (booked slots are greyed out)
Request a booking, track its status, cancel it
Full address and host phone number are revealed only after the host confirms

For hosts

Add and edit rooms with photos, amenities, house rules, hourly price and opening hours
Dashboard with pending requests, confirm / reject / cancel with a reason
Activate or deactivate a room anytime

Platform

JWT authentication with Guest and Host roles (protected routes and APIs)
Double booking is blocked at the database level using a PostgreSQL exclusion constraint
Mobile-first responsive UI
🧰 Tech stack
Layer	Technology
Frontend	Angular 19 (standalone components, signals), TypeScript, hand-written CSS
Backend	Java 17, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, Bean Validation
Database	PostgreSQL (btree_gist extension)
Hosting	Vercel (frontend), Render (backend, Docker), Neon (PostgreSQL)
Tooling	Docker, Docker Compose, GitHub Actions CI, Postman
🏗️ Architecture
HTML / JS
REST + JWT
JDBC + SSL
Browser
VercelAngular app
RenderSpring Boot API
NeonPostgreSQL
🔒 Preventing double bookings

Two guests booking the same room for the same time should never both succeed, even under concurrent requests. Checking in application code alone is not enough, so the rule lives in the database:

sql
ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (property_id WITH =, tsrange(start_at, end_at) WITH &&)
WHERE (status IN ('PENDING', 'CONFIRMED'));
Overlapping PENDING / CONFIRMED bookings for the same room are rejected by PostgreSQL itself (API returns 409)
Back-to-back bookings are allowed (10:00-12:00 then 12:00-13:00)
Rejecting or cancelling a booking frees the slot again
🔐 Privacy by design
Information	Visible to
Area, photos, price, rules	Everyone
Full address	Host, and the guest after confirmation
Phone numbers	Both sides after confirmation
📸 Screenshots
Home / search	Room details and booking	Host dashboard
Home	Room	Host
🗂️ Project structure
backend/     Spring Boot API (Dockerfile, pom.xml)
frontend/    Angular app (vercel.json, Dockerfile)
docs/        Postman collections, screenshots
docker-compose.yml   run the full stack locally
render.yaml          Render blueprint (backend)
DEPLOY.md            deployment notes
🚀 Run locally

Option 1: Docker

bash
docker compose up --build

Frontend: http://localhost:4200 · API: http://localhost:8081

Option 2: manual

Create a local PostgreSQL database named restnest
Backend
bash
cd backend
# set DB_PASSWORD to your local postgres password, then:
mvn spring-boot:run          # http://localhost:8081
Frontend
bash
cd frontend
npm install
npm start                    # http://localhost:4200
⚙️ Environment variables

Backend (Render)

Variable	Description
DB_URL	jdbc:postgresql://<neon-host>/<db>?sslmode=require
DB_USER, DB_PASSWORD	Neon database credentials
JWT_SECRET	Random string, 32+ characters
ADMIN_EMAIL, ADMIN_PASSWORD	Seeded admin account
CORS_ORIGINS	Frontend URL, https://rest-nest-navy.vercel.app/login

Frontend (Vercel, build time)

☁️ Deployment
Part	Platform	Settings
Database	Neon	Direct (non-pooled) connection, sslmode=require
Backend	Render (Docker web service)	Dockerfile backend/Dockerfile, health check /api/auth/health
Frontend	Vercel	Root directory frontend, build npm run build, output dist/restnest-frontend/browser, env API_URL

Angular routes need a rewrite so that refreshing a page does not return 404. frontend/vercel.json:

json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }

Room photos are stored in PostgreSQL, because the free Render filesystem is ephemeral.

🔌 API overview

Interactive docs are not bundled; the main endpoints are listed below. Import docs/postman/ to try them.

Area	Endpoint	Access
Auth	POST /api/auth/register, POST /api/auth/login	Public
Search	GET /api/properties?area=&hub=&minPrice=&maxPrice=&guests=&amenities=&rules=&sort=&page=	Public
Room	GET /api/properties/{id}, GET /api/properties/{id}/availability?date=	Public
Host rooms	POST/GET/PUT/DELETE /api/host/properties, POST /api/host/properties/{id}/photos	Host
Guest bookings	POST /api/bookings, GET /api/bookings, POST /api/bookings/{id}/cancel	Guest
Host bookings	GET /api/host/bookings, POST /api/host/bookings/{id}/confirm | reject | cancel	Host
🗄️ Database

users · properties · property_photos · property_amenities · property_rules · bookings · stored_files

🧪 Testing
Postman collections with automated assertions (auth, search filters, validation, security, booking rules, overlap prevention): docs/postman/
GitHub Actions builds backend and frontend on every push
🛣️ Roadmap
[ ] Admin panel (room approval, user moderation)
[ ] ID / KYC verification with a "Verified" badge
[ ] Reviews and ratings after a stay
[ ] Online payment (Razorpay test mode) and refund rules
👤 Author

Suresh S
