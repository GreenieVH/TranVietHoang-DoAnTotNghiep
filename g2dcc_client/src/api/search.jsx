import API from "@/config/api";
import APIAUTH from '../config/apiAuth';

export const adminSearch = async (searchTerm, filters = {}) => {
  const params = new URLSearchParams();
  params.append('searchTerm', searchTerm);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      params.append(`filters[${key}]`, value);
    });
  }
  const response = await APIAUTH.get(`/search/admin?${params.toString()}`);
  return response.data;
};

export const userSearch = async (searchTerm, filters = {}) => {
  const params = new URLSearchParams();
  params.append('searchTerm', searchTerm);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      params.append(`filters[${key}]`, value);
    });
  }
  const response = await API.get(`/search/user?${params.toString()}`);
  return response.data;
};
