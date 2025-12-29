import styled from "styled-components";

const navBox = styled.footer`
    display: flex;
    width: 100%;
    height: 60px;
    padding: 8px 24px;
    justify-content: space-between;
    align-items: center;
    background: #FFF;
    box-shadow: 0 -2px 2px 0 rgba(0, 0, 0, 0.25);
`;

const navItems = [
    {label: "Home", icon:"/home-navbar.svg", href: "/homepage" },
    {label: "Calendar", icon: "/calendar-navbar.svg", href: "/appointmentpage"},
    {label: "My pets", icon: "/mypets-navbar.svg", href:"/homepage"},
    {label: "Community", icon: "/community-navbar.svg", href:"/homepage"},
    {label: "Notifications", icon: "/notifications-navbar.svg", href:"/homepage"}
]

export default function NavBar() {
    return(
        <navBox>
            <div></div>
        </navBox>
    );
}