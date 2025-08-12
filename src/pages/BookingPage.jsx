import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axiosInstance from "../axiosInstance";
import "../styles/BookingPage.css";

function BookingPage({ stadiumID }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [time, setTime] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]); // New: store booked times for selected date & stadium

  const timeSlots = [
    "09:00 - 11:00",
    "11:00 - 13:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "19:00 - 21:00",
    "21:00 - 23:00"
  ];

  // Fetch all booked dates (for calendar coloring)
  useEffect(() => {
    axiosInstance.get("/bookings")
      .then(res => {
        setBookedDates(res.data.map(b => b.bookingDate));
      })
      .catch(err => console.error("Error fetching bookings:", err));
  }, []);

  // Fetch booked time slots when selectedDate or stadiumID changes
  useEffect(() => {
    if (!selectedDate || !stadiumID) {
      setBookedTimeSlots([]);
      return;
    }

    const bookingDateStr = selectedDate.toISOString().split("T")[0];

    axiosInstance.get("/bookings")
      .then(res => {
        // Filter bookings for selected date AND stadiumID
        const bookedForDateAndStadium = res.data.filter(
          b => b.bookingDate === bookingDateStr && b.stadiumID === Number(stadiumID)
        );

        // Extract booked time slots from these bookings
        const times = bookedForDateAndStadium.map(b => {
          // Format as "HH:MM - HH:MM"
          const start = b.startTime.slice(0, 5); // e.g. "09:00"
          const end = b.endTime.slice(0, 5); // e.g. "11:00"
          return `${start} - ${end}`;
        });

        setBookedTimeSlots(times);
      })
      .catch(err => console.error("Error fetching bookings for date:", err));
  }, [selectedDate, stadiumID]);

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      alert("You cannot book a past date.");
      return;
    }

    setSelectedDate(date);
    setTime(""); // reset selected time on new date
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Check or create customer
      const customerRes = await axiosInstance.post("/customers/check-or-create", {
        email,
        phone,
        name
      });
      const customerID = customerRes.data.customerID;

      // 2️⃣ Create booking
      const bookingDate = selectedDate.toISOString().split("T")[0];
      const [startTime, endTime] = time.split(" - ");

      await axiosInstance.post("/bookings", {
        customerID,
        stadiumID: Number(stadiumID),
        bookingDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        status: "PENDING"
      });

      alert("Booking successful!");
      setName("");
      setPhone("");
      setEmail("");
      setTime("");
      setSelectedDate(null);
      setBookedTimeSlots([]);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to make booking, please try again.");
    }
  };

  // Calendar tile styling
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const formatted = date.toISOString().split("T")[0];

      if (date < today) {
        return "bg-secondary text-white rounded"; // past date - gray
      }
      if (formatted === today.toISOString().split("T")[0]) {
        return "bg-primary text-white rounded"; // today - blue
      }
      if (bookedDates.includes(formatted)) {
        return "bg-warning text-dark rounded"; // booked - yellow
      }
      return "bg-success bg-opacity-50 text-dark rounded"; // available - light green
    }
    return null;
  };

  return (
    <div className="booking-container">
      <h2 className="text-center mb-4">Book a Stadium</h2>

      {/* Calendar */}
      <Calendar
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
      />

      {/* Booking Form */}
      {selectedDate && (
        <div className="booking-card mt-4" style={{ maxWidth: "500px", width: "100%" }}>
          <h5 className="text-center mb-3">
            Booking for {selectedDate.toDateString()}
          </h5>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {/* Phone */}
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {/* Time */}
            <div className="mb-3">
              <label className="form-label">Select Time</label>
              <select
                className="form-select"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              >
                <option value="">Choose...</option>
                {timeSlots.map((slot, index) => (
                  <option
                    key={index}
                    value={slot}
                    disabled={bookedTimeSlots.includes(slot)} // disable if booked
                  >
                    {slot} {bookedTimeSlots.includes(slot) ? "(Booked)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={!time}>
              Confirm Booking
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default BookingPage;
