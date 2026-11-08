import { defineStore } from "pinia";
import { client } from "boot/axios.js";

// Statistika sahifasining agregat ko'rsatkichlari (kartalar + pipeline).
// Dashboard va Pipeline bir xil davrni so'raganda bitta so'rov bo'lishilsin
// deb promise keshlanadi.
export const useStatistics = defineStore('statistics', () => {
  const cache = {};

  async function fetchSummary({ dateFrom, dateTo, force = false }) {
    const key = `${dateFrom}|${dateTo}`;

    if (!force && cache[key]) {
      return cache[key];
    }

    const promise = client
      .get(`statistics/summary?from=${dateFrom}&to=${dateTo}`)
      .catch(error => {
        delete cache[key];
        throw error;
      });

    cache[key] = promise;
    return promise;
  }

  return { fetchSummary };
});
