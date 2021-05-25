import { notification } from "antd";

const Notify = (
  type: string = "success",
  title: string = "",
  content: string = ""
) => {
  notification[type]({
    message: title,
    description: content,
    duration: 2,
  });
};

export default Notify;
