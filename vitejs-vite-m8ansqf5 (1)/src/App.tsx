import { useState, useEffect } from "react";
import "./App.css";

type Role = "directeur" | "chef" | "employe";
type MissionStatus = "À faire" | "En cours" | "Terminée";

type User = {
  name: string;
  username: string;
  password: string;
  role: Role;
};

type Mission = {
  title: string;
  status: MissionStatus;
};

type Planning = {
  employe: string;
  jour: string;
  heure: string;
};

type Message = {
  from: string;
  text: string;
};

export default function App() {
  /* --------- CHARGEMENT SAUVEGARDE --------- */
  const load = <T,>(key: string, fallback: T): T => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [users, setUsers] = useState<User[]>(() =>
    load("users", [
      { name: "FANANDRIANA Yazid", username: "yazid", password: "admin", role: "directeur" },
      { name: "Erij BEN SALEM", username: "erij", password: "1234", role: "employe" },
      { name: "Maëlys FRECHARD", username: "maelys", password: "1234", role: "employe" }
    ])
  );

  const [missions, setMissions] = useState<Mission[]>(() => load("missions", []));
  const [planning, setPlanning] = useState<Planning[]>(() => load("planning", []));
  const [messages, setMessages] = useState<Message[]>(() => load("messages", []));

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [login, setLogin] = useState({ username: "", password: "" });

  const [newMission, setNewMission] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [newUser, setNewUser] = useState<User>({
    name: "",
    username: "",
    password: "",
    role: "employe"
  });

  const [newPlanning, setNewPlanning] = useState<Planning>({
    employe: "",
    jour: "",
    heure: ""
  });

  /* --------- SAUVEGARDE AUTO --------- */
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("missions", JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem("planning", JSON.stringify(planning));
  }, [planning]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  /* --------- LOGIN --------- */
  if (!currentUser) {
    return (
      <div className="login">
        <h1>📘 Portail de communication</h1>
        <p>Planning · Missions · Messagerie</p>

        <input
          placeholder="Identifiant"
          onChange={e => setLogin({ ...login, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          onChange={e => setLogin({ ...login, password: e.target.value })}
        />

        <button onClick={() => {
          const user = users.find(
            u => u.username === login.username && u.password === login.password
          );
          user ? setCurrentUser(user) : alert("Identifiants incorrects");
        }}>
          Connexion
        </button>
      </div>
    );
  }

  const isManager = currentUser.role !== "employe";

  return (
    <div className="app">
      <header>
        <h2>{currentUser.name}</h2>
        <span className="badge">{currentUser.role}</span>
        <button onClick={() => setCurrentUser(null)}>Déconnexion</button>
      </header>

      {/* -------- MISSIONS -------- */}
      <section className="card">
        <h3>📌 Missions</h3>

        {isManager && (
          <div className="row">
            <input
              placeholder="Nouvelle mission"
              value={newMission}
              onChange={e => setNewMission(e.target.value)}
            />
            <button onClick={() => {
              setMissions([...missions, { title: newMission, status: "À faire" }]);
              setNewMission("");
            }}>
              Ajouter
            </button>
          </div>
        )}

        {missions.map((m, i) => (
          <div key={i} className="row">
            {m.title}
            {isManager ? (
              <>
                <select
                  value={m.status}
                  onChange={e => {
                    const copy = [...missions];
                    copy[i].status = e.target.value as MissionStatus;
                    setMissions(copy);
                  }}
                >
                  <option>À faire</option>
                  <option>En cours</option>
                  <option>Terminée</option>
                </select>
                <button onClick={() => setMissions(missions.filter((_, idx) => idx !== i))}>
                  Supprimer
                </button>
              </>
            ) : (
              <span className="badge">{m.status}</span>
            )}
          </div>
        ))}
      </section>

      {/* -------- PLANNING -------- */}
      <section className="card">
        <h3>🗓️ Planning</h3>

        {isManager && (
          <div className="row">
            <select onChange={e => setNewPlanning({ ...newPlanning, employe: e.target.value })}>
              <option>Employé</option>
              {users.filter(u => u.role !== "directeur").map(u => (
                <option key={u.username}>{u.name}</option>
              ))}
            </select>
            <input placeholder="Jour" onChange={e => setNewPlanning({ ...newPlanning, jour: e.target.value })} />
            <input placeholder="Horaire" onChange={e => setNewPlanning({ ...newPlanning, heure: e.target.value })} />
            <button onClick={() => setPlanning([...planning, newPlanning])}>
              Ajouter
            </button>
          </div>
        )}

        {planning
          .filter(p => currentUser.role !== "employe" || p.employe === currentUser.name)
          .map((p, i) => (
            <div key={i}>{p.employe} — {p.jour} — {p.heure}</div>
          ))}
      </section>

      {/* -------- MESSAGERIE -------- */}
      <section className="card">
        <h3>💬 Messagerie</h3>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i}><b>{m.from}</b> : {m.text}</div>
          ))}
        </div>

        <div className="row">
          <input
            placeholder="Écrire un message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button onClick={() => {
            setMessages([...messages, { from: currentUser.name, text: newMessage }]);
            setNewMessage("");
          }}>
            Envoyer
          </button>
        </div>
      </section>
    </div>
  );
}
