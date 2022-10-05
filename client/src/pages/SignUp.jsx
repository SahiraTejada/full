import axios from "axios";
import app from "../firebase";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { loginFailure, loginStart, loginSuccess } from "../redux/userSlice";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
//import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { async } from "@firebase/util";
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import userDefault from '../imgs/usuario.svg';
import { useEffect } from "react";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 56px);
  color: ${({ theme }) => theme.text};
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.soft};
  padding: 20px 50px;
  gap: 10px;
`;

const Title = styled.h1`
  font-size: 24px;
`;

const SubTitle = styled.h2`
  font-size: 20px;
  font-weight: 300;
`;

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 3px;
  padding: 10px;
  background-color: transparent;
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  border-radius: 3px;
  border: none;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.textSoft};
`;

const More = styled.div`
  display: flex;
  margin-top: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const Links = styled.div`
  margin-left: 50px;
`;

const Link = styled.span`
  margin-left: 30px;
`;

const Text = styled.p`
color:white;
cursor:pointer;
`
const InputImg = styled.input`
  border: 1px solid #aaaaaa;
  color:white;
  border-radius: 3px;
  padding: 7px;
  background-color: transparent;
  
`;

const SignIn = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imguser,setImgUser] = useState(undefined)
  const [imgPerc,setImgPerc] = useState(undefined)
  const [isSignUp, setSignUp] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});

  
  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await axios.post("/auth/signin", { name, password });
      dispatch(loginSuccess(res.data));
      navigate("/")
    } catch (err) {
      dispatch(loginFailure());
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await axios.post("/auth/signup", { name,email, password });
      dispatch(loginSuccess(res.data));
      navigate("/")
    } catch (err) {
      dispatch(loginFailure());
      console.error(err.response.data);
    }
  };

  /*const signInWithGoogle = async () => {
    dispatch(loginStart());
    //signInWithPopup(auth, provider)
      .then((result) => {
       
        axios
          .post("http://localhost:8800/api/auth/google", {
            
            email: result.user.email,
            img: result.user.photoURL,
          })
          .then((res) => {
            console.log(res)
            dispatch(loginSuccess(res.data));
            navigate("/")
          });
      })
      .catch((error) => {
        dispatch(loginFailure());
        console.log("ero")
      });
  };*/
 const handleChange = (e) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };


   const uploadFile = (file, urlType) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
       if(urlType === "img")  { setImgPerc(Math.round(progress)) 
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
            break;
        }
      }
      },
      (error) => {},
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setInputs((prev) => {
            return { ...prev, [urlType]: downloadURL };
          });
        });
      }
    );
  };

  

  useEffect(() => {
    imguser && uploadFile(imguser, "img");
  }, [imguser]);

  const handleUpload = async (e)=>{
    e.preventDefault();
  
    const res = await axios.post("/auth/signup", {...inputs})
    res.status===200 && navigate('/signin')
  }
  
  return (
    <Container>
      <Wrapper>
        <Title>Sign in</Title>
        <SubTitle>to continue to LamaTube</SubTitle>
       
        <Title>or</Title>
        <Input
          placeholder="username"
          name="name"
          onChange={handleChange}
        />
        <Input placeholder="email" name="email" onChange={handleChange} />
        <Input
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />
     
        <Button onClick={handleSignUp}>Sign up</Button>

        Image:
        {imgPerc > 0 ? (
          "Uploading:" + imgPerc + "%"
        ) : (
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImgUser(e.target.files[0])}
          />
        )}
        <Button onClick={handleUpload}>Upload</Button>
        
      
        
      </Wrapper>
      
    </Container>
  );
};

export default SignIn;