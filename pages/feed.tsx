import { GetServerSideProps } from "next";
import React, { FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../services/supabase";

export default function Feed(props) {
  const { user } = useContext(AuthContext);
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState(props.posts);

  useEffect(() => {
    supabase
      .from("posts")
      .on("INSERT", (response) => {
        setPosts((state) => [...state, response.new]);
      })
      .subscribe();
  }, []);

  async function sendPost(event: FormEvent) {
    event.preventDefault();

    if (!newPost.trim()) {
      return;
    }

    const { error } = await supabase.from("posts").insert({
      content: newPost,
    });

    if (error) {
      console.log(error);
      return;
    }

    setNewPost("");
  }

  return (
    <form onSubmit={sendPost}>
      <div>
        <textarea
          placeholder="Escreve alguma coisa..."
          onChange={(event) => setNewPost(event.target.value)}
          value={newPost}
        />
        <button type="submit">Enviar</button>
      </div>

      <ul>
        {posts.map((post) => {
          return <li key={post.id}>{post.content}</li>;
        })}
      </ul>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { user } = await supabase.auth.api.getUserByCookie(ctx.req);

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const response = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: true });

  return {
      props:{
          posts: response.body
      }
  }
};
