const escapePdfText = (value) => {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
};

const formatMoney = (value) => `${value.toFixed(2)} DH`;

const buildContentStream = (order) => {
  const date = new Date(order.createdAt).toLocaleString("fr-FR");
  const customer = order.user?.name || order.user?.email || "Client";
  const lines = [
    "Facture Marketplace",
    `Commande: ${order._id}`,
    `Client: ${customer}`,
    `Date: ${date}`,
    `Statut: ${order.status}`,
    "",
    "Articles",
    "-----------------------------------------------",
    ...order.items.flatMap((item) => [
      `${item.name}`,
      `  Quantite: ${item.quantity} | Prix: ${formatMoney(item.price)} | Sous-total: ${formatMoney(item.subtotal)}`,
    ]),
    "-----------------------------------------------",
    `Total a payer: ${formatMoney(order.total)}`,
  ];

  return [
    "BT",
    "/F1 12 Tf",
    "50 790 Td",
    "16 TL",
    ...lines.map((line) => `(${escapePdfText(line)}) Tj T*`),
    "ET",
  ].join("\n");
};

export const createInvoicePdf = (order) => {
  const content = buildContentStream(order);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ];

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(chunks.join(""), "utf8"));
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = Buffer.byteLength(chunks.join(""), "utf8");
  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");

  offsets.slice(1).forEach((offset) => {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });

  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return Buffer.from(chunks.join(""), "utf8");
};
