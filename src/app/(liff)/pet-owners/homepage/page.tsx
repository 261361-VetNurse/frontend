"use client"
import styled from "styled-components";

const Box = styled.div `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: red;
    padding: 8px 24px;
    gap: 16px;

    .header-box{
        width: 348px;
        height: 50px;
        background-color: #F7F7F7;
        gap: 10px;
        display: flex;
        align-items: center;
    }
`;

export default function HomePage() {
    return(
        <Box>
            <div className="header-box">
                <img src="/Ava.svg" alt="Ava" />
                <span>Hi!</span>
                <span>username</span>
                <img src="/help.svg" alt="help" className="ml-auto" />
            </div>
        </Box>
    );
}