export const separateArrayByElCount = (array: any[], size: number): any[][] => {
  const subarray = [];
  for (let i = 0; i < Math.ceil(array.length / size); i++) {
    subarray[i] = array.slice(i * size, i * size + size);
  }
  return subarray;
};
