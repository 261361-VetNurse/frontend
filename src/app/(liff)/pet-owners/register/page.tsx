"use client"
import styled from "styled-components";

const Register = styled.div`
    background-color: #F7F7F7;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;

    .icon{
        width: 78px;
        height: 82px;
        margin-top: 46px;
    }
    .title{
        color: #000;
        font-weight: 500;
    }
    .warp{
        margin-left: 33px;
    }
`;

export default function RegisterPage() {
    return(
        <Register>
            <img src="/icon.svg" alt="icon" className="icon" />
            <div className="title text-2xl" >Register</div>
            <div className="warp">
                <div className="title text-[16px] mt-6">กรุณากรอกข้อมูลต่อไปนี้</div>
            </div>
        </Register>
    )

}