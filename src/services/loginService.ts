import axios from "axios";
import jwt_decode from "jwt-decode";
import { baseUrl } from "../common/constant";

export const login = async (userName: string, password: string) => {
  const { data } = await axios.post(baseUrl + "/api/auth/login", { userName, password });
  localStorage.setItem("accessToken", data.accessToken);

  return data;
}

export const checkLogin = (): boolean => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) return false;

  const decode = jwt_decode(accessToken) as any;

  if (decode.exp < Date.now() / 1000) {

    localStorage.clear();
    return false;
  }

  return true;
}