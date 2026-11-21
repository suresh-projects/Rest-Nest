# RestNest Frontend (Angular 19)

Mobile-first UI for the RestNest backend (Spring Boot + PostgreSQL).

## Run
1. Backend (IntelliJ) run aagi irukkanum: http://localhost:8081
2. Terminal la intha folder la:
       npm install
       npm start
3. Browser: http://localhost:4200

Node 18.19+ / 20.11+ / 22 venum (`node -v` check pannunga).
Backend port maathina: `src/app/core/config.ts` la API_URL maathunga.
Backend CORS already http://localhost:4200 ku allow pannirukku.

## Pages
/                         Search + filters (area, hub, price, guests, amenities, rules, sort, paging)
/property/:id             Gallery, details, rules, booking panel (date, hours, slot picker, guests, purpose, rules accept)
/login, /register         Guest or Host sign up
/my-bookings              Guest: status tabs, cancel, address + host phone after confirmation
/host                     Host dashboard: stats + pending requests
/host/properties          My rooms: edit, activate / deactivate
/host/properties/new      Add room: details, price, timing, amenities, rules, photos
/host/properties/:id/edit Edit room + photo upload / delete
/host/bookings            Requests: confirm, reject, cancel with reason

## Test flow (demo ku)
1. Host account register (Sign up -> "I have a room") -> Add a room (photos serththu).
2. Logout -> Guest account register -> Find a room -> room open -> date, hours, start time -> Request booking.
3. Guest kku address hidden irukkum ("Waiting for host").
4. Logout -> Host login -> Dashboard / Requests -> Confirm.
5. Guest login -> My bookings -> address + host phone theriyum.
6. Rendu guest account la ore slot book panni paarunga: 2nd guest ku slot grey aagi irukkum (backend overlap lock).

## Build for production
    npm run build        (output: dist/restnest-frontend/browser)
