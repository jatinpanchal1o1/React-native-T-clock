/* =====================
   SAFE HELPERS
===================== */
 const safeNumber = (n: number) => {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
};

export default safeNumber;