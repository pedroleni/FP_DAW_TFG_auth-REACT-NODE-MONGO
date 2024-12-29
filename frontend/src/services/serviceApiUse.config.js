import axios from "axios";
import { updateToken } from "../utils";

const APIHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  Authorization: `Bearer ${updateToken()}`,
});

export const APIuser = () =>
  axios.create({
    baseURL: `https://fptfgauth-production.up.railway.app/api/v1`,
    headers: APIHeaders(),
    timeout: 600000,
  });

