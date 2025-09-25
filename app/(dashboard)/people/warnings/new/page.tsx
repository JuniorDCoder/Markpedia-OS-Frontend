"use client";

import { useState } from "react";
import WarningFormClient from "@/components/sections/WarningFormClient";
import PIPFormClient from "@/components/sections/PIPFormClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewWarningPipPage() {
    const [type, setType] = useState<"warning" | "pip">("warning");

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create {type === "warning" ? "Warning" : "PIP"}</CardTitle>
                    <CardDescription>Select the type of record to create</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select onValueChange={(val: "warning" | "pip") => setType(val)} value={type}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="pip">Performance Improvement Plan (PIP)</SelectItem>
                        </SelectContent>
                    </Select>

                    {type === "warning" ? <WarningFormClient mode="create" /> : <PIPFormClient mode="create" />}
                </CardContent>
            </Card>
        </div>
    );
}
