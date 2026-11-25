# PRD: Desk Booking

## 1. Goal

Employees of a single office spend too long looking for a free desk. The goal is to let an employee secure a desk before arriving, in under one minute.

**Success metric:** in the first month after launch, at least 90% of bookings are completed within one minute, measured from opening the desk list to the booking confirmation.

## 2. Users

Office employees, signed in with their company account. People who are not signed in see nothing. All dates and times are in the office's local time zone.

## 3. Requirements

| ID | Requirement |
|---|---|
| R1 | An employee sees which desks are free on a chosen date, from today up to 14 days ahead. |
| R2 | An employee books one free desk for a whole day within that range. An employee holds at most one booking per date. A desk holds at most one booking per date: when two employees try to book it, the first confirmed request wins and the other is told the desk is taken and shown the updated list. |
| R3 | An employee cancels their own booking for today or a later date, which frees the desk immediately. Only the owner can cancel it. |
| R4 | The desk list is shown within 2 seconds for 95% of requests. |
| R5 | When the list or a booking cannot be completed, the employee sees an error message, no booking is created and they can retry. |

## 4. Out of scope

- Native mobile application. The application is a web page usable on phone and desktop browsers.
- Meeting rooms.
- Check-in, automatic release of unused bookings and reminders. To be reconsidered after the first month if booked desks are often left empty.
- Managing the desk inventory: the list of desks is fixed and loaded at setup.

## 5. User stories

### US1: See free desks (R1, R4, R5)

As an employee, I want to see the free desks for a date, so that I can choose one.

- Given a date from today to 14 days ahead, when I open the desk list, then I see the desks with no booking on that date.
- Given no desk is free, when I open the list, then I see a message saying the office is full that day.
- Given the list cannot be loaded, when I open it, then I see an error message and can retry.

### US2: Book a desk (R2, R5)

As an employee, I want to book a free desk, so that I know I have a place before I arrive.

- Given a free desk and no booking of mine on that date, when I book it, then I see a confirmation and it is no longer listed as free.
- Given another employee booked the desk first, when I try to book it, then I am told it is taken and see the updated list.
- Given I already have a booking on that date, when I try to book another desk, then I am told to cancel the first one.
- Given the booking cannot be saved, when I try to book, then I see an error message, no booking exists and I can retry.

### US3: Cancel a booking (R3, R5)

As an employee, I want to cancel my booking, so that someone else can use the desk.

- Given my booking for today or later, when I cancel it, then the desk is listed as free for that date.
- Given another employee's booking, when I view it, then I cannot cancel it.
- Given the cancellation cannot be saved, when I try to cancel, then I see an error message, my booking remains and I can retry.
