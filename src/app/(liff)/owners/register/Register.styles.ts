import styled from 'styled-components';

export const RegisterContainer = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const RegisterCard = styled.div`
  width: 100%;
  max-width: 420px;
  min-width: 360px;

  @media (max-width: 480px) {
    min-width: auto;
    max-width: 100%;
  }
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

export const Title = styled.h1`
  font-size: 40px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

export const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 480px) {
    gap: 18px;
  }
`;
