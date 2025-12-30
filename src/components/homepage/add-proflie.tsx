import styled from "styled-components";

const AddProfileWrapper = styled.div`
    width: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .avatar{
        width: 60px;
        height: 60px;
        border-radius: 60px;
        background-color: #09BFF8;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .icon{
        width: 24px;
        height: 24px;
        cursor: pointer;
        transition: all 0.3s ease-in-out;

        &:hover{
            rotate: 90deg;
        }
    }
    .text1{
        color: #000;
        text-align: center;
        font-size: 13px;
        font-weight: 400;
    }
`;

export default function AddProflie() {
    return (
        <AddProfileWrapper>
            <div className="avatar">
                <img src="/add-pet.svg" alt="add-pet" className="icon" />
            </div>
            <div className="text1">New Pet</div>
        </AddProfileWrapper>
    );
}