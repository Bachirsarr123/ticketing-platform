import { useState } from "react";

function ReserveForm({ ticketTypeId }) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buyerName || !buyerPhone) {
      alert("Nom et téléphone obligatoires");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/purchase/${ticketTypeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buyer_name: buyerName,
            buyer_phone: buyerPhone,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erreur lors de la réservation");
        setLoading(false);
        return;
      }

      setQr(data.qr); // 👈 on garde le QR pour l’afficher

    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      {qr ? (
        <>
          <p>🎉 Ticket réservé !</p>
          <img src={qr} alt="QR Code du ticket" width="200" />
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Votre nom"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
          />
          <br />

          <input
            type="tel"
            placeholder="Téléphone"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
          />
          <br />

          <button type="submit" disabled={loading}>
            {loading ? "Réservation..." : "Réserver"}
          </button>
        </form>
      )}
    </div>
  );
}

export default ReserveForm;
