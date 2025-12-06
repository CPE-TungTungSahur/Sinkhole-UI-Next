import { Drawer } from "antd";

export default function PointDetailsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    <Drawer title="Basic Drawer" placement={"right"} closable={true} onClose={onClose} open={isOpen}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
    </Drawer>;
}
