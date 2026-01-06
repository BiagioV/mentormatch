# API (riassunto)

## Auth
- POST /api/auth/register {name,email,password,role}
- POST /api/auth/login {email,password}
- POST /api/auth/logout
- GET  /api/auth/me

## Mentors
- GET /api/mentors?sector=&language=&minRating=&hasAvailability=1
- GET /api/mentors/:id
- GET /api/mentors/:id/slots
- GET /api/mentors/:id/reviews

## Slots (MENTOR)
- POST /api/slots {start_time,end_time}
- DELETE /api/slots/:slotId

## Bookings
- POST /api/bookings {slot_id} (MENTEE)
- GET /api/bookings/mine
- POST /api/bookings/:id/cancel
- POST /api/bookings/:id/meeting-link {meeting_link} (MENTOR)

## Reviews (MENTEE)
- POST /api/reviews {booking_id,rating,comment}
