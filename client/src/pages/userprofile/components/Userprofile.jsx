import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Post from "../../../reusable-components/post/Post";
import Announce from "../../../reusable-components/announcement/Announce";
import Nav from "../../nav/components/Nav";
import CreateAnnouncement from "../../../reusable-components/announcement/CreateAnnouncement";
import CreatePost from "../../../reusable-components/post/CreatePost";
import "../stylesheets/Userprofile.css";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Userprofile({ userLoggedIn }) {
  const token = localStorage.getItem("token");
  const { username } = useParams();
  const [user, setUser] = useState([]);
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateAnnounceOpen, setIsCreateAnnounceOpen] = useState(false);

  const filteredPosts = posts.filter((el) => el.username === user.username);
  const filteredAnnouncements = announcements.filter(
    (el) => el.username === user.username
  );

  const fetchUser = async () => {
    try {
      const userResponse = await axios.get(
        `https://backend.dosshs.online/api/user?username=${username}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setUser(userResponse.data.other);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const announcementResponse = await axios.get(
        "https://backend.dosshs.online/api/announcement",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setAnnouncements(announcementResponse.data);

      const postResponse = await axios.get(
        "https://backend.dosshs.online/api/post",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setPosts(postResponse.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      await fetchUser();
      if (isMounted) {
        fetchPosts();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  return (
    <>
      <Helmet>
        <title>{`DOS - ${user.username}`}</title>
        <meta property="og:title" content={`${user.fullname}`} />
        {/* Add other meta tags as needed */}
      </Helmet>

      <div className="container">
        <Nav />
        <div className="dashboard --userprofile">
          <h2 className="--big-h2">Profile</h2>
          <div className="userprofile-container">
            <div className="profile-pic --userprofile-pic"></div>
            <p className="display-name" style={{ fontSize: "1.3rem" }}>
              {user.fullname}
            </p>
            <p className="username" style={{ fontSize: "1rem" }}>
              {" "}
              @{user.username}
            </p>
            {user.bio ? <p className="bio">"{user.bio}"</p> : null}
          </div>
          <div className="userpost-container">
            <div className="userpost-container-header">
              {user._id === userLoggedIn._id ? (
                <h2 style={{ fontSize: "1.5rem" }}>
                  Your Post & Announcements
                </h2>
              ) : (
                <h2 style={{ fontSize: "1.5rem" }}>
                  {user.username} Posts & Announcements
                </h2>
              )}
              {user._id === userLoggedIn._id ? (
                <div>
                  <button
                    className="post-btn"
                    style={{ marginRight: "1rem" }}
                    onClick={() => {
                      setIsCreateAnnounceOpen(!isCreateAnnounceOpen);
                    }}
                  >
                    Make an Announcement
                  </button>
                  <button
                    className="post-btn"
                    onClick={() => {
                      setIsCreatePostOpen(!isCreatePostOpen);
                    }}
                  >
                    Post Something
                  </button>
                </div>
              ) : null}
            </div>
            <div className="user-post-and-announcements">
              <div className="user-announcement">
                {filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((filteredAnnounce) => (
                    <Announce
                      key={filteredAnnounce._id}
                      fullname={filteredAnnounce.fullname}
                      username={filteredAnnounce.username}
                      content={filteredAnnounce.content}
                    />
                  ))
                ) : (
                  <p className="empty">You haven't created announcement yet</p>
                )}
              </div>
              <div className="user-post">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((filteredPost) => (
                    <Post
                      key={filteredPost._id}
                      fullname={filteredPost.fullname}
                      username={filteredPost.username}
                      content={filteredPost.content}
                      date={filteredPost.dateCreated}
                    />
                  ))
                ) : (
                  <p className="empty">You haven't posted anything</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCreatePostOpen && (
        <CreatePost
          fullname={user.fullname}
          username={user.username}
          userId={user._id}
          onPostCreated={handlePostCreated}
          onModalClose={() => {
            setIsCreatePostOpen(!isCreatePostOpen);
          }}
        />
      )}
      {isCreateAnnounceOpen && (
        <CreateAnnouncement
          fullname={user.fullname}
          username={user.username}
          userId={user.userId}
          onAnnouncementCreated={handlePostCreated}
          onModalClose={() => {
            setIsCreateAnnounceOpen(!isCreateAnnounceOpen);
          }}
        />
      )}
    </>
  );
}
