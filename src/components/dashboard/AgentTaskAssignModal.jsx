import React from "react";
import "./AgentTaskAssignModal.scss";
import AgentOperations from "../../services/AgentOperations";

class AgentTaskAssignModal extends React.Component {
  constructor() {
    super();
    this.state = {
      agentDataRecordsUnderController: [],
      selectedAgentData: null,
    };
  }

  formatKeyLabel = (key) => {
    const lastKey = key.split(".").pop();

    return lastKey
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  componentDidMount() {
    const payload = {
        dcCode: this.props.data.dcCode.id,
    };
    AgentOperations.FetchAllAgentInformation(payload)
      .then((response) => {
        this.setState({
          agentDataRecordsUnderController: response.data.data,
        });
      })
      .catch((error) => {
        console.error("Error fetching agent data:", error);
      });
  }

  getNotificationColor = (count) => {
    if (count > 50) return "#8b0000";
    if (count > 20) return "#f39c12";
    return "#2ecc71";
  };
  getNotificationWidth = (count) => {
    if (count > 50) return "90%";
    if (count > 20) return "50%";
    return "20%";
  };

  assignTask = (event) => {
    event.preventDefault();
    if (!this.state.selectedAgentData) {
      return alert("Please select an agent to assign the task.");
    }

    const payload = {
      agentId: this.state.selectedAgentData.id,
      recordId: this.props.data.id,
    };

    AgentOperations.assignTaskToAgent(payload)
      .then((response) => {
        return alert(response.data.responseMessage || "Task assigned successfully.");
      })
      .catch((error) => {
        console.error("Task Assigning failed:", error.response || error);
        alert(
          error.response?.data?.responseMessage ||
            "Task Assignment failed. Please try again.",
        );
      });
  };

  render() {
    return (
      <div
        className="agent-task-assign-view-outer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="agent-task-assign-view-outer-popup">
          <div className="agent-task-assign-view-outer-popup-header">
            <div className="agent-task-assign-view-outer-popup-header-left"></div>
            <div className="agent-task-assign-view-outer-popup-header-right">
              <button onClick={this.props.onClose}>✕</button>
            </div>
          </div>
          <div className="agent-task-assign-table-wrapper">
            <table className="agent-task-assign-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>User Role</th>
                  <th>Notifications</th>
                </tr>
              </thead>
              <tbody>
                {this.state.agentDataRecordsUnderController.map((agent) => (
                  <tr
                    key={agent.id}
                    onClick={() => {
                      this.setState({
                        selectedAgentData: agent,
                      });
                    }}
                    className={
                      this.state.selectedAgentData?.id === agent.id
                        ? "selected-row"
                        : ""
                    }
                  >
                    <td>{agent.username}</td>
                    <td>{agent.userRole?.role}</td>
                    <td>
                      <div className="notification-cell">
                        <span className="notification-count">
                          {agent.notifications}
                        </span>

                        <div className="notification-bar-container">
                          <div
                            className="notification-bar"
                            style={{
                              width: this.getNotificationWidth(
                                agent.notifications,
                              ),
                              backgroundColor: this.getNotificationColor(
                                agent.notifications,
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="agent-task-assign-view-outer-popup-footer">
            <button onClick={this.assignTask}>Assign</button>
          </div>
        </div>
      </div>
    );
  }
}

export default AgentTaskAssignModal;
