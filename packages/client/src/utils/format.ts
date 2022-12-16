export const size = (value: number) => {
  const kb = +Number(value / 1024).toFixed(2);
  if (kb < 1) return `${value} Byte`;
  if (kb >= 1) {
    const mb = +Number(kb / 1024).toFixed(2);
    if (mb < 1) return `${kb} Kb`;
    if (mb >= 1) return `${mb} Mb`;
  }
};
