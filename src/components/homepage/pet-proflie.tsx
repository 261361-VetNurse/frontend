import styled from "styled-components";

const Proflie = styled.div`
    width: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .avatar{
        width: 60px;
        height: 60px;
        border-radius: 60px;
        background-color: #FFB1E2;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .icon{
        width: 50px;
        height: 50px;
    }
    .name{
        color: #000;
        text-align: center;
        font-size: 13px;
        font-weight: 400;
    }
`;

export default function ProflieCom() {
    return(
        <Proflie>
            <div className="avatar">
                <img className="icon" src="/pet-ex1.svg" alt="pet-ex1" />
            </div>
            <div className="name">name</div>
        </Proflie>
    )
}
