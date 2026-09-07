from fastapi import APIRouter, UploadFile

router = APIRouter(prefix="/resumes", tags=["resume-processing"])


@router.post("/upload")
async def upload_resume(file: UploadFile):
    return {
        "filename": file.filename,
        "status": "received",
        "parsed_profile": None,
    }
