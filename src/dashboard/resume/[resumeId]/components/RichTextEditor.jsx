import { Button } from "@/components/ui/button";
import { ResumeInfoContext } from "@/context/ResumeInfoContext";
import { Brain, LoaderCircle } from "lucide-react";
import React, { useContext, useState } from "react";
import { chatSession } from "../../../../../service/AIModel";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  Editor,
  EditorProvider,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { toast } from "sonner";

const PROMPT = 'position title: {positionTitle}, Depends on position title give me 5-7 bullet points for my experience in resume (Please do not add experience level and No JSON array), give me result in HTML tags';

const RichTextEditor = ({ onRichTextEditorChange, index, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || '');
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [loading, setLoading] = useState(false);

  const GenerateSummeryFromAI = async () => {
    setLoading(true);
    
    if (!resumeInfo.experience || !resumeInfo.experience[index] || !resumeInfo.experience[index].title) {
      toast.error('Please add Position Title');
      setLoading(false);
      return;
    }
    
    try {
      const prompt = PROMPT.replace('{positionTitle}', resumeInfo.experience[index].title);
      console.log(prompt);
      
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      console.log(responseText);
      
      // Process the AI response
      let formattedHTML = '';
      
      try {
        // First check if the response is a JSON string
        const jsonResponse = JSON.parse(responseText);
        
        if (jsonResponse.bullet_points && Array.isArray(jsonResponse.bullet_points)) {
          // Convert the bullet points array to an HTML list
          formattedHTML = '<ul>' + 
            jsonResponse.bullet_points.map(point => `<li>${point}</li>`).join('') + 
            '</ul>';
        } else {
          // If JSON is valid but doesn't have expected structure, 
          // convert it to a string representation
          formattedHTML = JSON.stringify(jsonResponse);
        }
      } catch (jsonError) {
        // If not valid JSON, use the raw response as is
        console.log("Not valid JSON, using raw response");
        formattedHTML = responseText;
      }
      
      // Update the editor value with the HTML string
      setValue(formattedHTML);
      
      // Trigger onChange to update parent component
      const mockEvent = {
        target: {
          value: formattedHTML
        }
      };
      onRichTextEditorChange(mockEvent);
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing AI response:", error);
      toast.error("Failed to generate content. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Summary</label>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-2 border-primary text-primary" 
          onClick={GenerateSummeryFromAI}
        >
          {loading ? <LoaderCircle className="animate-spin" /> : <Brain className="h-4 w-4" />}
          Generate From AI
        </Button>
      </div>
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onRichTextEditorChange(e);
          }}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
};

export default RichTextEditor;