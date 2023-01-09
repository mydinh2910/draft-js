import axios from "axios"
import { baseUrl } from "../common/constant"
import { IPostData } from "./post.interface";

export const getPost = async () => {
  const { data } = await axios.get(baseUrl + "/api/post");

  return data.list;
}

export const updatePost = async (id: number, data: any)=> {
  const response = await axios.put(baseUrl + `/api/post/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`
    }
  });

  return response.data;
}

export const deletePost = async (postId: number) => {
  const response = await axios.delete(baseUrl + `/api/post/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`
    }
  });

  return response.data;
}

export const createPost = async (data: IPostData) => {
  const response = await axios.post(baseUrl + `/api/post`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`
    }
  });

  return response.data;
}