import { Button } from "@/components/ui/button";
import React, { useContext, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ResumeInfoContext } from "@/context/ResumeInfoContext";
import GlobalApi from "../../../../../../service/GlobalApi.js";
import { chatSession } from "../../../../../../service/AIModel.js";
import { useParams } from "react-router-dom";
import { Brain, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const prompt =
  "Job Title: {jobTitle} , Depends on job title give me list of  summery for 3 experience level, Mid Level and Freasher level in 3 -4 lines in array format, With summery and experience_level Field in JSON Format";

const Summery = ({ enabledNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [summery, setSummery] = useState();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const [aiGeneratedSummery, setAiGeneratedSummery] = useState();

  useEffect(() => {
    summery &&
      setResumeInfo({
        ...resumeInfo,
        summery: summery,
      });
  }, [summery]);

  const GenerateSummeryFromAI = async () => {
    try {
      if (!resumeInfo?.jobTitle) {
        toast.error("Please add a job title first");
        return;
      }

      const PROMPT = prompt.replace("{jobTitle}", resumeInfo.jobTitle);
      setLoading(true);
      console.log(PROMPT);

      const result = await chatSession.sendMessage(PROMPT);
      const responseText = result.response.text();
      console.log("Raw response:", responseText);

      // Extract JSON from the response
      let jsonData;
      
      // Check if response contains markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch && jsonMatch[1]) {
        // If we found JSON in code blocks, use the content between the backticks
        jsonData = jsonMatch[1].trim();
        console.log("Extracted JSON from code blocks:", jsonData);
      } else {
        // Otherwise use the whole response
        jsonData = responseText.trim();
      }
      
      // Parse the JSON data
      const parsedData = JSON.parse(jsonData);
      setAiGeneratedSummery(parsedData);
      console.log("Parsed data:", parsedData);
    } catch (error) {
      console.error("Error processing AI response:", error);
      toast.error("Failed to process AI response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSave = (e) => {
    e.preventDefault();

    if (!summery) {
      toast.error("Please add a summary");
      return;
    }

    setLoading(true);
    const data = {
      data: {
        summery: summery,
      },
    };
    
    GlobalApi.UpdateResumeDetails(params?.resumeId, data)
      .then((resp) => {
        console.log(resp);
        enabledNext(true);
        toast.success("Details updated");
      })
      .catch((error) => {
        console.error("Error saving details:", error);
        toast.error("Failed to save details");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Summary</h2>
        <p>Add summary for your job title</p>
        <form className="mt-7" onSubmit={onSave}>
          <div className="flex justify-between ">
            <label>Add summary</label>

            <Button
              type="button"
              onClick={GenerateSummeryFromAI}
              variant="outline"
              size="sm"
              className="border-primary text-primary items-center flex gap-2"
              disabled={loading || !resumeInfo?.jobTitle}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Brain />
              )}
              Generate from AI
            </Button>
          </div>
          <Textarea
            className="mt-5"
            onChange={(e) => setSummery(e.target.value)}
            value={summery}
            placeholder="Enter your professional summary here"
          />
          <div className="mt-2 flex justify-end">
          <Button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className='animate-spin' />:'Save'}
          </Button>
          </div>
        </form>
      </div>
      {aiGeneratedSummery && (
        <div className="my-5">
          <h2 className="font-bold text-lg">Suggestions</h2>
          {Array.isArray(aiGeneratedSummery) ? (
            aiGeneratedSummery.map((item, index) => (
              <div
                key={index}
                onClick={() => setSummery(item?.summary)}
                className="p-5 shadow-lg my-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <h2 className="font-bold my-1 text-primary">
                  Level: {item?.experience_level}
                </h2>
                <p>{item?.summary}</p>
              </div>
            ))
          ) : (
            <div className="p-5 shadow-lg my-4 rounded-lg bg-yellow-50">
              <p className="text-yellow-700">
                Unable to parse suggestions properly. Please try again.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Summery;