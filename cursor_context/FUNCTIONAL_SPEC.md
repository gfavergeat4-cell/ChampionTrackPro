# Functional Spec - MVP

## Roles
- Admin: import team schedule (ICS), create sessions, view athlete responses.
- Athlete: see team sessions, fill post-session questionnaire (3 sliders: intensity, fatigue, wellbeing).
- Coach: (later) view aggregated team data.

## Core Features
- Firebase Auth (email/password)
- Firestore: teams/{teamId}/events/{eventId}/responses/{responseId}
- Admin imports .ics → creates sessions.
- Athlete sees only their team’s events + their responses.
