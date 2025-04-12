import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BikeRental() {
  const [inventory, setInventory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === "danadrobot101@gmail.com");
    });
  }, []);

  useEffect(() => {
    const bikesRef = collection(db, "bikes");
    const bookingsQuery = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
    const notifRef = collection(db, "notifications");

    const unsubBikes = onSnapshot(bikesRef, snapshot => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubBookings = onSnapshot(bookingsQuery, snapshot => {
      setBookings(snapshot.docs.map(doc => doc.data()));
    });
    const unsubNotif = onSnapshot(notifRef, snapshot => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubBikes();
      unsubBookings();
      unsubNotif();
    };
  }, [user]);

  const getMonth = (timestamp) => {
    const date = new Date(timestamp?.toDate?.());
    return `${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const filteredBookings = monthFilter
    ? bookings.filter(b => getMonth(b.timestamp) === monthFilter)
    : bookings;

  const bookingsByBike = filteredBookings.reduce((acc, b) => {
    acc[b.bikeId] = (acc[b.bikeId] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(bookingsByBike),
    datasets: [
      {
        label: "Бронирования",
        data: Object.values(bookingsByBike),
        backgroundColor: "rgba(168, 85, 247, 0.6)",
      },
    ],
  };

  const addNotification = async (message) => {
    await addDoc(collection(db, "notifications"), {
      message,
      timestamp: new Date()
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-800 to-black text-white">
        <h1 className="text-3xl mb-4">Вход администратора</h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          signInWithEmailAndPassword(auth, email, password).catch(err => alert("Ошибка входа: " + err.message));
        }} className="w-80 flex flex-col gap-4">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit">Войти</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-black text-white p-4 md:p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Аренда велосипедов</h1>

      {isAdmin && (
        <>
          <div className="bg-white text-black rounded-xl p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">📢 Уведомления</h2>
            <ul className="list-disc list-inside text-sm mb-4">
              {notifications.map(n => (
                <li key={n.id}>{n.message}</li>
              ))}
            </ul>
            <form onSubmit={e => {
              e.preventDefault();
              const value = e.target.message.value;
              if (value) {
                addNotification(value);
                e.target.reset();
              }
            }} className="flex gap-2">
              <Input name="message" placeholder="Новое уведомление" />
              <Button type="submit">Отправить</Button>
            </form>
          </div>

          <div className="bg-white text-black rounded-xl p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">📊 Статистика по бронированиям</h2>
            <label className="block mb-2 font-medium">Выбери месяц (например 4-2025):</label>
            <Input
              placeholder="месяц-год"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="mb-4"
            />
            <Bar data={chartData} />
          </div>
        </>
      )}
    </div>
  );
}
