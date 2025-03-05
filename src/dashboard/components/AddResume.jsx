import { Loader2, PlusSquare } from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';
import GlobalApi from "./../../../service/GlobalApi";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const AddResume = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [resumeTitle, setResumeTitle] = useState('');
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const navigation=useNavigate();
    const onCreate = async() => {
        setLoading(true);
        const uuid = uuidv4();  //to add the resume id
        console.log("GlobalApi object:", GlobalApi); // Log first to verify it's defined
        console.log(resumeTitle, uuid);
        
        const data = {
            title: resumeTitle,
            resumeId: uuid,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            userName: user?.fullName
        };
        
        try {
            // Use async/await for cleaner error handling
            const response = await GlobalApi.CreateNewResume(data);
            console.log("documentId:", response.data.data.documentId);

            setLoading(false);
            
            navigation('/dashboard/resume/'+response.data.data.documentId+"/edit");

            setOpenDialog(false); // Close dialog on success
        } catch (error) {
            console.error("Error details:", error);
            setLoading(false);
        }
    };
    
    return (
        <div>
            <div 
                className="p-14 py-24 border items-center flex justify-center bg-secondary rounded-lg h-[280px] hover:scale-105 transition-all hover:shadow-md cursor-pointer border-dashed" 
                onClick={() => setOpenDialog(true)}
            >
                <PlusSquare />
            </div>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Resume</DialogTitle>
                        <DialogDescription>
                            <p>Add a title for your new resume</p>
                            <Input 
                                className='my-2' 
                                placeholder='Ex: Full stack Resume'
                                onChange={(e) => setResumeTitle(e.target.value)}
                                value={resumeTitle}
                            />
                        </DialogDescription>
                        <div className="flex justify-end gap-5">
                            <Button 
                                onClick={() => setOpenDialog(false)} 
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!resumeTitle || loading}
                                onClick={onCreate}
                            >
                                {loading ? <Loader2 className="animate-spin"/> : 'Create'}
                            </Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddResume;