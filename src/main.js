import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { KeyController } from "./KeyController";
import axios from "axios";
import house from "../models/house.obj";
import "../images/menubar.svg";

const address = "http://localhost:8000/";
function main() {
    const canvas = document.querySelector("#three-canvas");

    const menuButton = document.querySelector("#menu-button");
    const signupButton = document.querySelector("#signup-button");
    const checkSignupButton = document.querySelector("#check-signup-button");
    const cancelSignupButton = document.querySelector("#cancel-signup-button");
    const loginButton = document.querySelector("#login-button");
    const logoutButton = document.querySelector("#logout-button");

    const loginPage = document.querySelector("#login-page");
    const signupPage = document.querySelector("#signup-page");
    const listPage = document.querySelector("#list-page");

    const loginId = document.querySelector("#login-id");
    const loginPw = document.querySelector("#login-pw");
    const signupId = document.querySelector("#signup-id");
    const signupPw = document.querySelector("#signup-pw");

    const inputboxs = document.querySelectorAll(".input-box");
    const listItem = document.querySelectorAll(".list");
    const objList = document.querySelector("#obj-list");

    let login;
    if (localStorage.getItem("login") == "true") {
        login = true;
    } else {
        login = false;
    }

    let menuToggle = true;
    let signupToggle = false;

    //로그인 확인
    window.onload = () => {
        if (login == true) {
            menuToggle = false;
            loginPage.style.display = "none";
        }
    };

    //menu 버튼 control
    menuButton.addEventListener("click", () => {
        if (menuToggle == true && login == true) {
            loginPage.style.display = "none";
            signupPage.style.display = "none";
            listPage.style.display = "none";
            menuToggle = false;
            signupToggle = false;
            for (let i = 0; i < inputboxs.length; i++) {
                inputboxs[i].value = "";
            }
            onfocus = "this.value=''";
        } else {
            if (login == true) {
                listPage.style.display = "flex";
            } else {
                loginPage.style.display = "flex";
            }
            menuToggle = true;
        }
    });

    //회원가입 창 띄우기
    signupButton.addEventListener("click", () => {
        if (signupToggle == true) {
            signupPage.style.display = "none";
            signupToggle = false;
        } else {
            signupPage.style.display = "flex";
            loginPage.style.display = "none";
            signupToggle = true;
        }
    });

    //회원가입 창 끄기
    cancelSignupButton.addEventListener("click", () => {
        signupToggle = false;
        signupPage.style.display = "none";
        loginPage.style.display = "flex";
    });

    //회원가입
    checkSignupButton.addEventListener("click", () => {
        axios
            .post(address + "/signup", {
                signupId: `${signupId}`,
                signupPw: `${signupPw}`,
            })
            .then((res) => {
                if (res.data == "true") {
                    //회원가입 성공
                    alert("회원가입 성공");
                    signupPage.style.display = "none";
                    loginPage.style.display = "flex";
                }
            })
            .catch((err) => {
                console.log("axios signup ERROR");
            });
    });
    //로그인 시도
    loginButton.addEventListener("click", () => {
        //임시 로그인 코드
        localStorage.setItem("login", "true");
        window.location.reload();
        //////////////////////////////////////////
        axios
            .post(address + "/login", {
                loginId: `${loginId.value}`,
                loginPw: `${loginPw.value}`,
            })
            .then((res) => {
                if (res.data.result == false) {
                    alert("로그인 실패");
                } else {
                    login = true;
                    localStorage.setItem("login", "true");
                    //list page의 list채우기
                    axios.get(address).then((res) => {
                        const objs = res.data;

                        for (let i = 0; i < objs.length; i++) {
                            const li = document.createElement("li");
                            const text = document.createTextNode(objs.value);

                            li.setAttribute("class", "list");
                            li.appendChild(text);
                            li.onclick((e) => {
                                axios
                                    .post(address + "/list", {
                                        objName: `${e.target.innerText}`,
                                    })
                                    .then((res) => {
                                        //refresh objviewer
                                        window.location.reload();
                                    })
                                    .catch((err) => {
                                        console.log("axios list ERROR");
                                    });
                            });
                            objList.appendChild(li);
                        }
                    });
                    loginPage.style.display = "none";
                    listPage.style.display = "flex";
                }
            })
            .catch((err) => {
                console.log("axios login ERROR");
            });
    });

    //로그아웃
    logoutButton.addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
    });

    //dumy list
    for (let i = 0; i < listItem.length; i++) {
        listItem[i].addEventListener("click", async (e) => {
            console.log(e.target.innerText);
        });
    }

    //threejs 부분
    {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });

        renderer.setClearColor("black");
        // 창사이즈 화면 크기에 맞추기
        renderer.setSize(window.innerWidth, window.innerHeight);

        // 고해상도로 만들기
        renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

        // Scene 생성
        const scene = new THREE.Scene();

        // Camera 생성
        const camera = new THREE.PerspectiveCamera(
            75, // 시야각
            window.innerWidth / window.innerHeight, // 종횡비(aspect)
            0.1, // near
            10000 // far
        );

        // Scene에 Camera 올리기 (기본 위치 x:0 y:0 z:0)
        camera.position.z = 300;
        camera.position.y = 100;
        camera.position.x = 100;
        camera.lookAt(50, 0, 0);
        scene.add(camera);

        // Controls
        const controls = new PointerLockControls(camera, renderer.domElement);

        controls.domElement.addEventListener("click", () => {
            controls.lock();
        });
        controls.addEventListener("lock", () => {
            console.log("lock!");
        });
        controls.addEventListener("unlock", () => {
            console.log("unlock!");
        });

        // 키보드 컨트롤
        const keyController = new KeyController();

        function walk() {
            if (menuToggle == false) {
                if (keyController.keys["KeyW"] || keyController.keys["ArrowUp"]) {
                    controls.moveForward(2);
                }
                if (keyController.keys["KeyS"] || keyController.keys["ArrowDown"]) {
                    controls.moveForward(-2);
                }
                if (keyController.keys["KeyA"] || keyController.keys["ArrowLeft"]) {
                    controls.moveRight(-2);
                }
                if (keyController.keys["KeyD"] || keyController.keys["ArrowRight"]) {
                    controls.moveRight(2);
                }
                if (keyController.keys["KeyN"]) {
                    camera.position.y -= 2;
                }
                if (keyController.keys["KeyM"]) {
                    camera.position.y += 2;
                }
            }
        }
        //light
        const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1); //빛의 색, 빛의 강도
        light.position.z = 0.5;
        scene.add(light);

        // obj파일 불러오기
        let objLoader = new OBJLoader();
        objLoader.load(house, (object) => {
            scene.add(object);
        });

        // 화면에 그리기
        function draw() {
            walk();
            renderer.render(scene, camera);
            renderer.setAnimationLoop(draw);
        }
        draw();

        // 반응형으로 창 크기 설정
        function setSize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.render(scene, camera);
        }
        window.addEventListener("resize", setSize);
    }
}
main();
