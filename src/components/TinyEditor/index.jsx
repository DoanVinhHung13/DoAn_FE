import { Editor } from "@tinymce/tinymce-react"
import PropTypes from "prop-types"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { changeModalLoading } from "src/redux/slices/common"
import FileService from "src/services/FileService"
import styled from "styled-components"

const TinyWrapper = styled.div``

const TinyEditor = props => {
  const {
    setLoading = () => {},
    height = `70vh`,
    onWordCount = () => {},
  } = props
  const [isFullScreen, setIsFullScreen] = useState(false)
  const dispatch = useDispatch()
  let useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  return (
    <TinyWrapper isFullScreen={isFullScreen}>
      <Editor
        {...props}
        tinymceScriptSrc="src/components/TinyEditor/tinymce/tinymce.min.js"
        licenseKey="gpl"
        init={{
          height,
          setup: function (ed) {
            ed.on("init", function () {
              setLoading(false)
              // Tắt hiệu ứng mờ dần
              // ed.settings.tox.dock_fade_duration = 0
            })
            ed.on("FullscreenStateChanged", function (e) {
              setIsFullScreen(e?.state)
            })
            ed.on("WordCountUpdate", function (e) {
              onWordCount(e?.wordCount)
            })
          },
          images_file_types: "svg,jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp",
          min_height: 300,
          file_picker_types: "image media",
          deprecation_warnings: false,
          selector: "textarea#open-source-plugins",
          font_size_formats:
            "8px 10px 12px 14px 16px 18px 20px 24px 28px 32px 36px 40px 48px 56px 64px",
          plugins:
            "media fullpage print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars",
          imagetools_cors_hosts: ["picsum.photos"],
          menubar: "file edit view insert format tools table help",
          toolbar:
            "undo redo | bold italic underline strikethrough fontfamily | fontsize | alignleft aligncenter alignright alignjustify lineheight | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak  charmap | fullscreen preview print | insertfile image media template link anchor codesample | ltr rtl",
          // toolbar_sticky: true,
          autosave_ask_before_unload: true,
          autosave_interval: "30s",
          autosave_prefix: "{path}{query}-{id}-",
          autosave_restore_when_empty: false,
          autosave_retention: "2m",
          image_advtab: true,

          font_formats:
            "Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n",
          fontsize_formats:
            "8px 10px 12px 14px 16px 18px 20px 24px 28px 32px 36px 40px 48px 56px 64px",
          image_class_list: [
            { title: "None", value: "" },
            { title: "Some class", value: "class-name" },
          ],
          importcss_append: true,
          save_onsavecallback: function () {},
          language: "vi",
          language_url: "/vi.js",
          paste_data_images: true,
          images_upload_handler: async function (blobInfo) {
            try {
              const formData = new FormData()
              formData.append("file", blobInfo?.blob())
              dispatch(changeModalLoading(true))
              const res = await FileService.uploadFile(formData)
              if (res?.isError) return
              return res?.Object
            } finally {
              dispatch(changeModalLoading(false))
            }
          },
          templates: [
            {
              title: "New Table",
              description: "creates a new table",
              content:
                '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>',
            },
            {
              title: "Starting my story",
              description: "A cure for writers block",
              content: "Once upon a time...",
            },
            {
              title: "New list with dates",
              description: "New List with dates",
              content:
                '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>',
            },
          ],
          template_cdate_format: "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
          template_mdate_format: "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
          image_caption: true,
          quickbars_selection_toolbar:
            "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
          noneditable_noneditable_class: "mceNonEditable",
          toolbar_mode: "sliding",
          contextmenu: "link image imagetools table",
          skin: useDarkMode ? "oxide-dark" : "oxide",
          content_css: useDarkMode ? "dark" : "default",
          content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
            img {
                max-width: 100%;
                height:auto;
                object-fit:cover;
                display: block;
                margin-left: auto;
                 margin-right: auto;
            }
            `,
          media_poster: false,
          media_alt_source: false,
          block_unsupported_drop: false,
          file_picker_callback: function (cb, value, meta) {
            let input = document.createElement("input")
            input.setAttribute("type", "file")
            input.setAttribute("accept", "image/*, video/*")
            input.onchange = async function () {
              let file = input.files[0]
              let reader = new FileReader()
              reader.onload = async function () {
                if (meta.filetype === "media" || meta.filetype === "image") {
                  try {
                    const formData = new FormData()
                    formData.append("file", file)
                    dispatch(changeModalLoading(true))
                    const res = await FileService.uploadFile(formData)
                    return cb(res?.Object)
                  } finally {
                    dispatch(changeModalLoading(false))
                  }
                }
                let id = "blobid" + new Date().getTime()
                let blobCache =
                  window.tinymce.activeEditor.editorUpload.blobCache
                let base64 = reader.result.split(",")[1]
                let blobInfo = blobCache.create(id, file, base64)
                blobCache.add(blobInfo)
                cb(blobInfo.blobUri(), { title: file.name })
              }
              reader.readAsDataURL(file)
            }

            input.click()
          },
        }}
      />
    </TinyWrapper>
  )
}

export const RenderTiny = props => (
  <TinyEditor
    {...props}
    onEditorChange={props?.onChange}
    // onBlur={onBlur}
    onChange={undefined}
    setLoading={props?.setLoading}
    placeholder={props?.placeholder || "Nhập nội dung"}
  />
)
export default TinyEditor

RenderTiny.propTypes = {
  onChange: PropTypes.func,
  setLoading: PropTypes.func,
  placeholder: PropTypes.string,
}
TinyEditor.propTypes = {
  onChange: PropTypes.func,
  setLoading: PropTypes.func,
  placeholder: PropTypes.string,
  height: PropTypes.string,
  onWordCount: PropTypes.func,
}
