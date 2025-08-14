import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axiosInstance from "../axiosInstance";
import "../styles/BookingPage.css";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CountrySelect from "../components/CountrySelect";  // <-- import here

function BookingPage() {
  const location = useLocation();
  const { stadiumID } = location.state || {};

  const [selectedDate, setSelectedDate] = useState(null);
  const [name, setName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+255");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [time, setTime] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);

  const timeSlots = [
    "09:00 - 11:00",
    "11:00 - 13:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "19:00 - 21:00",
    "21:00 - 23:00",
  ];

  useEffect(() => {
    if (!stadiumID) return;
    axiosInstance
      .get("/bookings")
      .then((res) => {
        const stadiumBookings = res.data.filter(
          (b) => b.stadiumID === Number(stadiumID)
        );
        setBookedDates(stadiumBookings.map((b) => b.bookingDate));
      })
      .catch((err) => console.error("Error fetching bookings:", err));
  }, [stadiumID]);

  useEffect(() => {
    if (!selectedDate || !stadiumID) {
      setBookedTimeSlots([]);
      return;
    }

    const bookingDateStr = selectedDate.toISOString().split("T")[0];
    axiosInstance
      .get("/bookings")
      .then((res) => {
        const bookedForDateAndStadium = res.data.filter(
          (b) =>
            b.bookingDate === bookingDateStr && b.stadiumID === Number(stadiumID)
        );

        const times = bookedForDateAndStadium.map((b) => {
          const start = b.startTime.slice(0, 5);
          const end = b.endTime.slice(0, 5);
          return `${start} - ${end}`;
        });

        setBookedTimeSlots(times);
      })
      .catch((err) => console.error("Error fetching bookings for date:", err));
  }, [selectedDate, stadiumID]);

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      toast.error("You cannot book a past date.");
      return;
    }

    setSelectedDate(date);
    setTime("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phone.length !== 9) {
      toast.error("Phone number must be exactly 9 digits.");
      return;
    }

    try {
      const customerRes = await axiosInstance.post("/customers/check-or-create", {
        email,
        phone: phonePrefix + phone,
        name,
      });
      const customerID = customerRes.data.customerID;

      const bookingDate = selectedDate.toISOString().split("T")[0];
      const [startTime, endTime] = time.split(" - ");
      const payload = {
        customerID,
        stadiumID: Number(stadiumID),
        bookingDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        status: "PENDING",
      };

      await axiosInstance.post("/bookings", payload);

      toast.success("Booking successful!");
      setName("");
      setPhone("");
      setEmail("");
      setTime("");
      setSelectedDate(null);
      setBookedTimeSlots([]);
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to make booking, please try again.");
    }
  };

  const isDateFullyBooked = (date) => {
    const formatted = date.toISOString().split("T")[0];
    const bookingsForDate = bookedDates.filter((d) => d === formatted).length;
    return bookingsForDate >= timeSlots.length;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const formatted = date.toISOString().split("T")[0];

      if (date < today) {
        return "bg-secondary text-white rounded";
      }
      if (isDateFullyBooked(date)) {
        return "fully-booked-date text-dark rounded";
      }
      if (bookedDates.includes(formatted)) {
        return "bg-warning text-dark rounded";
      }
      return "bg-success bg-opacity-50 text-dark rounded";
    }
    return null;
  };

  return (
    <div className="booking-container" style={{ position: "relative" }}>
      <h2 className="text-center mb-4">Book Stadium #{stadiumID}</h2>

      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

      {selectedDate && (
        <div
          className="booking-card mt-4"
          style={{
            maxWidth: "500px",
            width: "100%",
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          }}
          role="dialog"
          aria-modal="true"
        >
          <h5 className="text-center mb-3">
            Booking for {selectedDate.toDateString()}
          </h5>
          <form onSubmit={handleSubmit}>
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

            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <div className="d-flex">
                <CountrySelect
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="9-digit number"
                  value={phone}
                  onChange={(e) => {
                    if (e.target.value.length <= 9) setPhone(e.target.value);
                  }}
                  required
                />
              </div>
            </div>

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
                    disabled={bookedTimeSlots.includes(slot)}
                  >
                    {slot} {bookedTimeSlots.includes(slot) ? "(Booked)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!time}
            >
              Confirm Booking
            </button>
          </form>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <style jsx>{`
        .fully-booked-date {
          background-color: rgba(255, 0, 0, 0.2) !important;
        }
      `}</style>
    </div>
  );
}

export default BookingPage;
