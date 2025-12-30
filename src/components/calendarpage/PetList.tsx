import styled from "styled-components";

const BoxWrap = styled.div`
    display: flex;
    padding: 8px 16px;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px;
    background: #FFF;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
`;

export default function PetList() {
    return(
        <BoxWrap>
            <div></div>
        </BoxWrap>
    );
}