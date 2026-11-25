# PRD: Desk Booking

## 1. Goal

Employees of a single office spend too long looking for a free desk. The goal is to let an employee secure a desk before arriving, in under one minute.

**Success metric:** employees like the application.

## 2. Users

Office employees, signed in with their company account.

## 3. Requirements

| ID | Requirement |
|---|---|
| R1 | An employee sees which desks are free on a chosen date. |
| R2 | An employee books one free desk for a whole day, up to 14 days ahead. |
| R3 | An employee cancels their own booking. |
| R4 | The application must be fast. |

## 4. Out of scope

- Native mobile application.
- Meeting rooms.

## 5. User stories

### US1: See free desks (R1)

As an employee, I want to see the free desks for a date, so that I can choose one.

- Given a date, when I open the desk list, then I see the desks with no booking on that date.

### US2: Book a desk (R2)

As an employee, I want to book a desk up to 30 days ahead, so that I can plan my month.

- Given a free desk, when I book it, then it is shown as booked.

### US3: Reminder (R7)

As an employee, I want a push notification from the mobile app on the morning of my booking, so that I do not forget it.

- Given a booking for today, when it is 08:00, then my phone shows a notification.
