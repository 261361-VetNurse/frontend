import Button from "@/components/admin/shared/Button";
import AddIcon from '@mui/icons-material/Add'

export default function AdminPage() {
  return (
    <div>
      <Button icon="left">
        <AddIcon></AddIcon>
        Add
      </Button>
    </div>
  );
}
