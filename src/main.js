import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { KeyController } from "./KeyController";

import house from "../models/house.obj";
import "../images/menubar.svg";

function main() {
    const canvas = document.querySelector("#three-canvas");

    const menuButton = document.querySelector("#menu-button");
    const signupButton = document.querySelector("#signup-button");
    const checksignupButton = document.querySelector('#check-sginup-button');

    const blurPage = document.querySelector("#blur-page");
    const signupPage = document.querySelector("#signup-page");

    const inputboxs = document.querySelectorAll('.input-box');

    let menuToggle = true;
    let login = false;
    let signupToggle = false;
    //menu 버튼 control
    menuButton.addEventListener("click", () => {
        if (menuToggle == true) {
            blurPage.style.display = "none";
            signupPage.style.display = "none";
            menuToggle = false;
            signupToggle = false;
            for(let i= 0;i<inputboxs.length;i++){
                inputboxs[i].value='';
            }
            onfocus="this.value=''"
        } else {
            blurPage.style.display = "flex";
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
            signupToggle = true;
            blurPage.style.display = "none";
        }
    });

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
