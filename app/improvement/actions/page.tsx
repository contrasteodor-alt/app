import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";

export default function ActionPlanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Action Plan</h1>

      <Card>
        <CardHeader>
          <CardTitle>New action</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input type="date" placeholder="Action date" />
          <Input placeholder="Owner" />

          <Textarea
            className="md:col-span-2"
            placeholder="Action description"
          />

          <Textarea
            className="md:col-span-2"
            placeholder="Root cause (5 Why, Ishikawa, observation)"
          />

          <Input type="date" placeholder="Due date" />

          <Select defaultValue="Open">
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
              <SelectItem value="Canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <Button className="md:col-span-2">Save action</Button>
        </CardContent>
      </Card>
    </div>
  );
}
