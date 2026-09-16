export interface Task {
  id: string;
  title: string;
  description: string;
  commandSnippet: string;
  snippetLanguage: string;
  acceptanceCriteria: string[];
  tags: string[];
}

export interface Milestone {
  id: string;
  title: string;
  slug: string;
  description: string;
  deliverables: string[];
  codeTemplate: string;
  language: string;
  verificationCommand: string;
}

export interface Module {
  id: string;
  code: string;
  title: string;
  description: string;
  estimatedHours: number;
  tasks: Task[];
}

export interface Phase {
  id: string;
  phaseNumber: number | string;
  title: string;
  subtitle: string;
  duration: string;
  mode: "Sequential" | "Parallel Track A" | "Parallel Track B";
  trackInfo?: string;
  description: string;
  iconName: string;
  rankBadge: string;
  modules: Module[];
  milestones: Milestone[];
}

export interface CapstoneProject {
  title: string;
  badge: string;
  description: string;
  architectureComponents: {
    layer: string;
    technologies: string[];
    details: string;
  }[];
  specifications: string[];
  securityControls: string[];
  defenseCriteria: string[];
  sampleRepoStructure: string;
  runbookSteps: string[];
}

export const ROADMAP_PHASES: Phase[] = [
  // ==========================================
  // PHASE 0: 14 Tasks + 1 Milestone
  // ==========================================
  {
    id: "phase-0",
    phaseNumber: 0,
    title: "Terminal Setup & Operating System Primitives",
    subtitle: "Command-Line Ergonomics, Shell Foundations & Kernel Boundaries",
    duration: "2 Weeks",
    mode: "Sequential",
    description:
      "Establish a robust command-line environment and master operating system primitives including process lifecycles, memory allocation, virtual filesystems, and modal stream editing.",
    iconName: "Terminal",
    rankBadge: "Cadet",
    modules: [
      {
        id: "mod-0.1",
        code: "0.1",
        title: "Terminal Multiplexing & Shell Setup",
        description: "Configure persistent terminal multiplexing with tmux and optimized modern shell profiles.",
        estimatedHours: 12,
        tasks: [
          {
            id: "task-0.1.1",
            title: "Configure tmux with custom status-bar, split panes & vi keybindings",
            description: "Install tmux and configure ~/.tmux.conf with split panes, window re-indexing, and mouse-mode support.",
            commandSnippet: `# ~/.tmux.conf
set -g prefix C-a
unbind C-b
bind C-a send-prefix
set -g mouse on
setw -g mode-keys vi
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
set -g base-index 1
setw -g pane-base-index 1`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "tmux sessions persist across detached terminal windows",
              "Prefix key remapped to Ctrl+A",
              "Vi navigation mode functional in buffer scroll"
            ],
            tags: ["tmux", "terminal", "cli"]
          },
          {
            id: "task-0.1.2",
            title: "Deploy Zsh with Starship Prompt & Fast Syntax Highlighting",
            description: "Replace default bash with zsh and install Starship prompt for asynchronous git & runtime telemetry.",
            commandSnippet: `# Install Starship prompt & evaluate in .zshrc
curl -sS https://starship.rs/install.sh | sh -s -- -y
echo 'eval "$(starship init zsh)"' >> ~/.zshrc
source ~/.zshrc`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Starship prompt renders git branch and execution time",
              "Prompt initializes without startup latency (<80ms)"
            ],
            tags: ["zsh", "starship", "shell"]
          },
          {
            id: "task-0.1.3",
            title: "Configure shell history expansion, persistent sessions & environment rc files",
            description: "Configure HISTSIZE, HISTFILESIZE, HISTCONTROL, and append-history options across shell reboots.",
            commandSnippet: `# ~/.zshrc history optimizations
export HISTFILE=~/.zsh_history
export HISTSIZE=50000
export SAVEHIST=50000
setopt APPEND_HISTORY
setopt INC_APPEND_HISTORY
setopt SHARE_HISTORY
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Shell commands persist across concurrent terminal windows",
              "Duplicate commands automatically deduped in history"
            ],
            tags: ["zsh", "history", "environment"]
          }
        ]
      },
      {
        id: "mod-0.2",
        code: "0.2",
        title: "Kernel Abstractions & Standard Streams",
        description: "Deconstruct Unix file descriptors, stdin/stdout/stderr redirections, pipes, and subshell executions.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-0.2.1",
            title: "Harness File Descriptors (0, 1, 2, 3+), pipe redirections & process substitution",
            description: "Execute complex command pipelines using standard streams, custom descriptors (3+), and process substitution.",
            commandSnippet: `# Redirect stdout and stderr independently and tee to audit log
command_exec 1> /tmp/app.stdout.log 2> /tmp/app.stderr.log
# Custom file descriptor 3 for diagnostic logging
exec 3>&1 1>>/tmp/execution.log 2>&1
echo "Log redirected to disk"
echo "Direct to terminal" >&3
# Process substitution syntax diff
diff <(ssh host1 "uname -r") <(ssh host2 "uname -r")`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Stdout and stderr cleanly split without cross-stream pollution",
              "Process substitution syntax diffs remote responses without temp disk files"
            ],
            tags: ["posix", "streams", "bash"]
          },
          {
            id: "task-0.2.2",
            title: "Signal trapping & process state lifecycle (SIGINT, SIGTERM, SIGHUP, ERR)",
            description: "Trap signals (SIGINT, SIGTERM, SIGHUP, SIGKILL) and write trap handlers for graceful teardown.",
            commandSnippet: `#!/usr/bin/env bash
set -Eeuo pipefail
cleanup() {
  echo "[!] Trapped interrupt signal. Purging temporary files..."
  rm -rf "\${TMP_DIR:-}"
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT ERR
TMP_DIR=$(mktemp -d)
sleep 100`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Script terminates cleanly upon SIGTERM with temporary directory removed",
              "Non-zero exit codes captured by set -e and ERR trap"
            ],
            tags: ["signals", "kernel", "automation"]
          }
        ]
      },
      {
        id: "mod-0.3",
        code: "0.3",
        title: "Memory Spaces, Linux Process Model & Virtual Filesystems",
        description: "Analyze resident set size (RSS), virtual memory (VIRT), paging, swap, and /proc introspection.",
        estimatedHours: 18,
        tasks: [
          {
            id: "task-0.3.1",
            title: "Introspect /proc filesystem for live process RSS, VIRT, and open FDs",
            description: "Extract kernel process limits, open file descriptors, and memory maps directly from /proc/$$/.",
            commandSnippet: `# Inspect open file descriptors of a PID
PID=$$
ls -l /proc/$PID/fd
cat /proc/$PID/status | grep -E "VmRSS|VmSize|Threads"
cat /proc/$PID/limits | grep "Max open files"`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Accurately calculate RSS memory usage from /proc/$PID/statm",
              "Verify maximum open files limit (nofile) for target processes"
            ],
            tags: ["procfs", "memory", "linux"]
          },
          {
            id: "task-0.3.2",
            title: "Trace system calls and library dependencies using strace and ltrace",
            description: "Profile process system call execution frequencies, I/O bottlenecks, and failed open/stat syscalls.",
            commandSnippet: `# Trace failing syscalls and count summary
strace -c -e trace=file,network ls -lh /var/log
strace -f -e trace=openat,read,write -p 1234 -o /tmp/trace.out`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "strace summary provides call count, errors, and execution time per syscall",
              "Failing syscalls pinpointed to exact file path arguments"
            ],
            tags: ["strace", "syscalls", "kernel"]
          },
          {
            id: "task-0.3.3",
            title: "Manage process priorities, niceness (nice/renice), and OOM killer scores",
            description: "Adjust CPU priority via nice/renice and inspect /proc/$PID/oom_score to evaluate crash vulnerability.",
            commandSnippet: `# Launch batch worker with lowest CPU priority
nice -n 19 python3 heavy_compute.py &
# Adjust existing process priority
renice -n 10 -p $!
# Inspect OOM killer score
cat /proc/$!/oom_score`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "ps -o pid,ni,cmd confirms niceness value of 19",
              "oom_score reflects priority against kernel memory reclamation"
            ],
            tags: ["processes", "oom", "scheduler"]
          },
          {
            id: "task-0.3.4",
            title: "Inspect kernel cgroup limits and namespace allocations in /proc/sys/fs",
            description: "Review system-wide file descriptor allocations, maximum PIDs, and kernel parameters in sysctl.",
            commandSnippet: `# Inspect kernel allocated file handles
cat /proc/sys/fs/file-nr
sysctl fs.file-max
sysctl kernel.pid_max`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Verify allocated file handles against maximum allowable system ceiling",
              "Identify maximum allowable process threads in current kernel"
            ],
            tags: ["sysctl", "kernel", "limits"]
          },
          {
            id: "task-0.3.5",
            title: "Analyze swap space utilization, dirty page writeback, and vm.swappiness",
            description: "Diagnose kernel virtual memory paging, page faults, and tune swappiness values.",
            commandSnippet: `# Inspect swap memory and paging statistics
vmstat 1 5
cat /proc/sys/vm/swappiness
grep -i swap /proc/meminfo`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "vmstat identifies swap in (si) and swap out (so) throughput",
              "Understand runtime implications of lowering vm.swappiness for database hosts"
            ],
            tags: ["memory", "swap", "vmstat"]
          }
        ]
      },
      {
        id: "mod-0.4",
        code: "0.4",
        title: "Vim Navigation, Stream Editors & Filesystems",
        description: "Master modal editing, regex stream processors (sed/awk), and block filesystem mount parameters.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-0.4.1",
            title: "Master modal Vim editing primitives, macro registers, and regex buffer replaces",
            description: "Navigate files efficiently using modal commands, visual block selections, registers, and search replaces.",
            commandSnippet: `# Vim search and replace across entire buffer
:%s/production_old/production_new/gc
# Record and replay macro into register 'a'
# qa -> [commands] -> q -> 5@a`,
            snippetLanguage: "vim",
            acceptanceCriteria: [
              "Perform global regex substitute with confirmation prompt",
              "Record and execute multi-line macro across repetitive configuration blocks"
            ],
            tags: ["vim", "editor", "cli"]
          },
          {
            id: "task-0.4.2",
            title: "Process text streams using sed stream editor with multiline address matching",
            description: "Execute non-interactive stream edits, in-place regex substitutions, and multiline replacements.",
            commandSnippet: `# In-place replacement with backup file
sed -i.bak 's/DEBUG = True/DEBUG = False/' settings.py
# Delete comment and empty lines
sed -i '/^#/d; /^$/d' config.ini`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "sed removes comments and empty lines without breaking valid configuration keys",
              "Backup .bak file generated successfully"
            ],
            tags: ["sed", "streams", "posix"]
          },
          {
            id: "task-0.4.3",
            title: "Parse columnar telemetry records using awk associative arrays and formatters",
            description: "Calculate column sums, averages, and group frequency distributions using awk.",
            commandSnippet: `# Calculate total bandwidth consumed per client IP from log
awk '{ip[$1] += $10} END {for (i in ip) print i, ip[i]/1024/1024 "MB"}' access.log | sort -k2 -nr | head -n 10`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "awk aggregates bandwidth bytes by IP into Megabytes",
              "Output sorted descending by highest consuming client"
            ],
            tags: ["awk", "text-processing", "analytics"]
          },
          {
            id: "task-0.4.4",
            title: "Create and mount a loopback ext4 block device with fstab security options",
            description: "Simulate dedicated block storage volumes using sparse disk images, loopback devices, and mount security flags.",
            commandSnippet: `# Create 500MB sparse file and format with ext4
dd if=/dev/zero of=/var/storage_test.img bs=1M count=500
mkfs.ext4 /var/storage_test.img
mkdir -p /mnt/custom_vol
mount -o loop,noexec,nosuid,nodev /var/storage_test.img /mnt/custom_vol
df -hT /mnt/custom_vol`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Loop device mounted with security flags (noexec, nosuid, nodev)",
              "df -h reflects dedicated volume filesystem boundary"
            ],
            tags: ["storage", "ext4", "fstab"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-0",
        title: "sys-init-probe: Automated Environment Diagnostic Utility",
        slug: "sys-init-probe",
        description:
          "Develop a zero-dependency POSIX bash script that scans host architecture, kernel versions, memory headroom, available file descriptors, and system entropy, generating a structured JSON health report.",
        deliverables: [
          "Executable sys-init-probe.sh with zero external dependencies (pure coreutils + /proc)",
          "Structured JSON output validating CPU, RAM, Disk, Inodes, and File Descriptors",
          "Automated exit status (0 for healthy, 1 for critical threshold breaches)"
        ],
        codeTemplate: `#!/usr/bin/env bash
# sys-init-probe.sh - Host telemetry probe
set -euo pipefail

TOTAL_MEM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
AVAIL_MEM_KB=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
MEM_PERCENT=$(( (TOTAL_MEM_KB - AVAIL_MEM_KB) * 100 / TOTAL_MEM_KB ))
FD_ALLOC=$(cat /proc/sys/fs/file-nr | awk '{print $1}')
FD_MAX=$(cat /proc/sys/fs/file-nr | awk '{print $3}')

cat <<EOF
{
  "hostname": "$(hostname)",
  "kernel": "$(uname -r)",
  "memory_used_percent": \${MEM_PERCENT},
  "file_descriptors_used": \${FD_ALLOC},
  "file_descriptors_max": \${FD_MAX},
  "status": "$([ \$MEM_PERCENT -lt 90 ] && echo 'HEALTHY' || echo 'DEGRADED')"
}
EOF`,
        language: "bash",
        verificationCommand: "./sys-init-probe.sh | jq ."
      }
    ]
  },

  // ==========================================
  // PHASE 1: 16 Tasks + 2 Milestones
  // ==========================================
  {
    id: "phase-1",
    phaseNumber: 1,
    title: "Linux Administration & Core Networking",
    subtitle: "Enterprise Systemd Engineering, POSIX Hardening & Socket Telemetry",
    duration: "3 Weeks",
    mode: "Sequential",
    description:
      "Deep dive into systemd service lifecycles, user group permissions, socket activation, network namespaces, iptables packet filtering, and packet debugging.",
    iconName: "Server",
    rankBadge: "SysAdmin",
    modules: [
      {
        id: "mod-1.1",
        code: "1.1",
        title: "User Permissions, Sudoers & POSIX ACLs",
        description: "Enforce least-privilege user isolation, sudoer drop-in configs, and POSIX Access Control Lists.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-1.1.1",
            title: "Configure Fine-Grained POSIX Access Control Lists (ACLs)",
            description: "Utilize setfacl and getfacl to grant specific read/write access to deployer service accounts without broad group elevation.",
            commandSnippet: `# Grant user 'deployer' rwx access to web application root
setfacl -R -m u:deployer:rwx /var/www/production
setfacl -R -d -m u:deployer:rwx /var/www/production
getfacl /var/www/production`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "getfacl reveals custom user entry with inherited default ACLs for future files",
              "Deployer can write files without being added to sudo group"
            ],
            tags: ["linux", "acl", "security"]
          },
          {
            id: "task-1.1.2",
            title: "Configure sudoers drop-in policy with NOPASSWD and command restrictions",
            description: "Create a drop-in file in /etc/sudoers.d/ allowing a service user to restart only specific daemons without password prompt.",
            commandSnippet: `# /etc/sudoers.d/99-deployer
deployer ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx, /bin/systemctl reload nginx
visudo -cf /etc/sudoers.d/99-deployer`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "visudo -cf validates syntax before activating rule",
              "deployer can restart nginx without sudo password, but cannot run arbitrary sudo commands"
            ],
            tags: ["sudo", "security", "linux"]
          },
          {
            id: "task-1.1.3",
            title: "Apply special file permissions: SUID, SGID, and Sticky Bit",
            description: "Audit binaries for SUID bits and configure SGID on shared collaborative directories.",
            commandSnippet: `# Find all SUID binaries on system
find / -perm -4000 -type f 2>/dev/null
# Configure SGID on shared team folder
chmod 2775 /srv/team_storage
# Configure sticky bit on temporary directory
chmod 1777 /tmp/sandbox`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Files created in /srv/team_storage automatically inherit the parent group ID",
              "Sticky bit prevents users from deleting files owned by others in shared directories"
            ],
            tags: ["permissions", "suid", "sgid"]
          },
          {
            id: "task-1.1.4",
            title: "Enforce user group separation and umask hardening defaults",
            description: "Audit default umask in /etc/login.defs and ~/.bashrc to ensure strict 0027 or 0077 file creation masks.",
            commandSnippet: `# Verify current umask and enforce strict creation mask
umask
umask 0027
touch /tmp/test_file.txt
ls -l /tmp/test_file.txt`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "New files created with rw-r----- (640) and directories with rwxr-x--- (750)",
              "Unprivileged others cannot read newly created files"
            ],
            tags: ["umask", "security", "permissions"]
          }
        ]
      },
      {
        id: "mod-1.2",
        code: "1.2",
        title: "Systemd Unit Engineering & Journalctl",
        description: "Design fault-tolerant systemd unit definitions with restart policies, sandboxing, and resource constraints.",
        estimatedHours: 18,
        tasks: [
          {
            id: "task-1.2.1",
            title: "Author Hardened Systemd Service with Memory Limits & PrivateTmp",
            description: "Create a systemd unit file incorporating ProtectSystem, PrivateTmp, and MemoryMax cgroup ceilings.",
            commandSnippet: `# /etc/systemd/system/api-worker.service
[Unit]
Description=API Backend Production Daemon
After=network.target

[Service]
Type=simple
User=apiuser
Group=apiuser
ExecStart=/usr/local/bin/api-worker --port 8080
Restart=always
RestartSec=5s
MemoryMax=512M
CPUQuota=80%
PrivateTmp=true
ProtectSystem=full
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target`,
            snippetLanguage: "ini",
            acceptanceCriteria: [
              "systemctl daemon-reload and systemctl start api-worker succeed",
              "systemctl status verifies MemoryMax cgroup constraint active"
            ],
            tags: ["systemd", "cgroups", "production"]
          },
          {
            id: "task-1.2.2",
            title: "Create systemd timer units replacing legacy cron jobs",
            description: "Author a .timer and matching .service pair for scheduled automated telemetry reporting.",
            commandSnippet: `# /etc/systemd/system/telemetry-backup.timer
[Unit]
Description=Runs telemetry backup every midnight

[Timer]
OnCalendar=*-*-* 00:00:00
Persistent=true

[Install]
WantedBy=timers.target`,
            snippetLanguage: "ini",
            acceptanceCriteria: [
              "systemctl list-timers shows next scheduled trigger time",
              "Persistent=true triggers missed job if machine was offline"
            ],
            tags: ["systemd", "timers", "automation"]
          },
          {
            id: "task-1.2.3",
            title: "Query and Filter Journalctl Logs with Field Selectors",
            description: "Extract structured diagnostic messages filtered by unit, priority level, and time windows.",
            commandSnippet: `# Extract warnings and errors from last 2 hours in JSON format
journalctl -u api-worker -p 3..4 --since "2 hours ago" -o json-pretty | head -n 30`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Journalctl outputs cleanly formatted JSON telemetry logs",
              "Only priority levels ERR and WARNING are retrieved"
            ],
            tags: ["journalctl", "logging", "systemd"]
          },
          {
            id: "task-1.2.4",
            title: "Implement socket activation for on-demand daemon initialization",
            description: "Configure systemd .socket unit that listens on TCP port 9000 and spawns daemon on first connection.",
            commandSnippet: `# /etc/systemd/system/custom-echo.socket
[Unit]
Description=Echo Service Socket

[Socket]
ListenStream=9000
Accept=yes

[Install]
WantedBy=sockets.target`,
            snippetLanguage: "ini",
            acceptanceCriteria: [
              "Port 9000 is open in listening state before service binary is even spawned",
              "Inbound network packet automatically spawns backing daemon"
            ],
            tags: ["systemd", "socket-activation", "networking"]
          }
        ]
      },
      {
        id: "mod-1.3",
        code: "1.3",
        title: "Core Networking, Sockets & Packet Filtering",
        description: "Diagnose TCP three-way handshakes, routing tables, DNS resolution with dig, and iptables rules.",
        estimatedHours: 20,
        tasks: [
          {
            id: "task-1.3.1",
            title: "Diagnose Active Sockets & Ports with ss and lsof",
            description: "Identify listening TCP/UDP sockets, established connection states, and process ownership.",
            commandSnippet: `# List all listening TCP ports with process binary names and PIDs
ss -tulpn
# Inspect open socket connections for port 443
lsof -i :443`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "State LISTEN filters accurately identify bound sockets",
              "Process ownership traced to parent PID"
            ],
            tags: ["networking", "sockets", "ss"]
          },
          {
            id: "task-1.3.2",
            title: "Formulate iptables and nftables packet filtering drop rules",
            description: "Apply stateful packet filtering, allow SSH/HTTP/HTTPS, and drop rogue ICMP flooding.",
            commandSnippet: `# Allow established connections and rate-limit SSH brute force
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -P INPUT DROP`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Rules persist via iptables-save or netfilter-persistent",
              "Incoming SSH connections beyond threshold are dropped"
            ],
            tags: ["iptables", "security", "firewall"]
          },
          {
            id: "task-1.3.3",
            title: "Inspect routing tables, default gateways, and policy routing (ip route/rule)",
            description: "Inspect CIDR routes, metric priorities, interface assignments, and multiple routing tables.",
            commandSnippet: `# Inspect kernel IP routing table
ip route show
# Inspect policy routing rules database
ip rule show`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Identify default gateway IP address and outbound network interface",
              "Understand destination CIDR matching priority"
            ],
            tags: ["networking", "routing", "iproute2"]
          },
          {
            id: "task-1.3.4",
            title: "Perform deep DNS resolution diagnostics using dig, drill, and /etc/resolv.conf",
            description: "Query specific authoritative nameservers, trace DNS delegation hierarchy, and inspect TTL caches.",
            commandSnippet: `# Trace complete DNS delegation path from root nameservers
dig +trace api.github.com
# Query specific nameserver for A and AAAA records
dig @8.8.8.8 api.github.com +noall +answer`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Trace reveals root, TLD, and authoritative nameserver delegations",
              "Validate DNS query response times and TTL expiration counters"
            ],
            tags: ["dns", "dig", "networking"]
          }
        ]
      },
      {
        id: "mod-1.4",
        code: "1.4",
        title: "Network Diagnostics, TLS & Dynamic Libraries",
        description: "Capture network packets with tcpdump, trace paths with mtr, probe TLS ciphers, and check shared libraries.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-1.4.1",
            title: "Capture and inspect raw network packets using tcpdump",
            description: "Filter live network traffic by interface, port, host IP, and write pcap files for Wireshark inspection.",
            commandSnippet: `# Capture 50 packets on port 80/443 and save to pcap file
sudo tcpdump -i any -nn -c 50 'port 80 or port 443' -w /tmp/traffic.pcap`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "tcpdump captures SYN, ACK, and data payload packets",
              "pcap file can be parsed with tcpdump -r or Wireshark"
            ],
            tags: ["tcpdump", "packets", "troubleshooting"]
          },
          {
            id: "task-1.4.2",
            title: "Trace network latency, MTU discovery, and packet loss using traceroute & mtr",
            description: "Identify router hops, intermediate ISP latency, packet drop rates, and path MTU black holes.",
            commandSnippet: `# Run live interactive MTR diagnostic
mtr --report --report-cycles 10 1.1.1.1`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Report lists packet loss percentage and average round-trip time across all hops",
              "Pinpoint hop where latency spike occurs"
            ],
            tags: ["mtr", "traceroute", "networking"]
          },
          {
            id: "task-1.4.3",
            title: "Test TLS handshakes, cipher negotiation, and cert validity via openssl s_client",
            description: "Connect directly to TLS server to inspect certificate chain, expiration dates, and supported cipher suites.",
            commandSnippet: `# Connect to remote host and extract SSL certificate expiry date
echo | openssl s_client -servername github.com -connect github.com:443 2>/dev/null | openssl x509 -noout -dates -issuer`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Outputs exact notBefore and notAfter certificate validity dates",
              "Verifies server certificate matches SNI hostname"
            ],
            tags: ["tls", "openssl", "certificates"]
          },
          {
            id: "task-1.4.4",
            title: "Inspect dynamic linker dependencies and shared object bindings with ldd",
            description: "Examine shared object dependencies of compiled binaries and diagnose missing lib symbols.",
            commandSnippet: `# Inspect shared libraries of system binaries
ldd /usr/bin/curl
# Check dynamic link loader cache
ldconfig -p | grep libssl`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "ldd lists resolved memory addresses for shared libraries (libc.so, libssl.so)",
              "Identify missing library errors (not found)"
            ],
            tags: ["ldd", "binaries", "linux"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-1.1",
        title: "server-stats.sh: Production Telemetry Extraction Script",
        slug: "server-stats",
        description:
          "Construct a comprehensive shell script server-stats.sh that calculates total/used CPU utilization, total/used RAM percentage, disk space allocation, top 5 memory-consuming processes, and top 5 CPU-consuming processes.",
        deliverables: [
          "Automated calculations for CPU idle percentage from /proc/stat or mpstat",
          "Clean tabular formatting for top 5 CPU & RAM processes",
          "Output banner showing logged-in users, OS version, and system uptime"
        ],
        codeTemplate: `#!/usr/bin/env bash
# server-stats.sh - Real-time system performance monitor
echo "=== SYSTEM PERFORMANCE TELEMETRY ==="
echo "Host: $(hostname) | Kernel: $(uname -r) | Uptime: $(uptime -p)"
echo "-----------------------------------"
# CPU Utilization
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8"%"}')
echo "Total CPU Usage: $CPU_USAGE"
# Memory Utilization
free -m | awk 'NR==2{printf "RAM: %s/%sMB (%.2f%% used)\n", $3,$2,$3*100/$2 }'
# Disk Utilization
df -h --total | grep total | awk '{printf "Disk: %s/%s (%s used)\n", $3,$2,$5}'
echo "-----------------------------------"
echo "Top 5 CPU-Consuming Processes:"
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head -n 6
echo "-----------------------------------"
echo "Top 5 Memory-Consuming Processes:"
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%mem | head -n 6`,
        language: "bash",
        verificationCommand: "bash server-stats.sh"
      },
      {
        id: "ms-1.2",
        title: "Custom Dummy Systemd Service (dummy.service)",
        slug: "dummy-service",
        description:
          "Create, install, and verify a background daemon service managed by systemd that writes heartbeat signals to /var/log/dummy-service.log and automatically restarts upon kill -9.",
        deliverables: [
          "Working /etc/systemd/system/dummy.service file",
          "Verification that kill -9 PID triggers immediate automatic restart within 2 seconds",
          "Validation via systemctl is-active and journalctl logs"
        ],
        codeTemplate: `# /etc/systemd/system/dummy.service
[Unit]
Description=Dummy Heartbeat Service
After=network.target

[Service]
Type=simple
ExecStart=/bin/bash -c "while true; do echo \\"[$(date -u)] Heartbeat ping\\" >> /var/log/dummy-service.log; sleep 5; done"
Restart=always
RestartSec=2s

[Install]
WantedBy=multi-user.target`,
        language: "ini",
        verificationCommand: "systemctl status dummy.service"
      }
    ]
  },

  // ==========================================
  // PHASE 2: Track A - Git & GitHub (13 Tasks)
  // ==========================================
  {
    id: "phase-2",
    phaseNumber: 2,
    title: "Version Control: Git Internals & GitHub Architecture",
    subtitle: "Plumbing Objects, Tree Traversal, Rebase Surgery & Pull Request Workflows",
    duration: "3 Weeks",
    mode: "Parallel Track A",
    trackInfo: "Track A (Morning): Git & GitHub Architecture",
    description:
      "Deconstruct blobs, trees, commits, annotated tags, refs, and the packed-refs architecture. Execute rebase surgery, commit squashes, and branch protection policies.",
    iconName: "GitBranch",
    rankBadge: "SysAdmin",
    modules: [
      {
        id: "mod-2.1",
        code: "2.1",
        title: "Git Object Graph & Low-Level Plumbing",
        description: "Explore the low-level object store (.git/objects) and trace content-addressable storage pointers.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-2.1.1",
            title: "Inspect raw git objects (blob, tree, commit, tag) via git cat-file",
            description: "Explore .git/objects, decode commit tree hashes, and trace ancestor lineages manually.",
            commandSnippet: `# Inspect the type and content of HEAD commit object
COMMIT_HASH=$(git rev-parse HEAD)
git cat-file -t $COMMIT_HASH
git cat-file -p $COMMIT_HASH
# Extract root tree object
TREE_HASH=$(git cat-file -p $COMMIT_HASH | grep tree | awk '{print $2}')
git cat-file -p $TREE_HASH`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Identify SHA hash pointers linking commit -> tree -> blob",
              "Differentiate between raw object types (commit, tree, blob, tag)"
            ],
            tags: ["git", "plumbing", "internals"]
          },
          {
            id: "task-2.1.2",
            title: "Trace SHA hash pointers and deconstruct the Git index staging tree",
            description: "Examine binary .git/index file using git ls-files --stage to observe staged content hashes.",
            commandSnippet: `# View staged index entries with permission modes and SHA hashes
git ls-files --stage`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Verify how git add creates blob objects before commit is ever generated",
              "Understand relationship between index and worktree"
            ],
            tags: ["git", "index", "staging"]
          },
          {
            id: "task-2.1.3",
            title: "Unpack Git references, packed-refs, and the reflog pointer mechanics",
            description: "Inspect .git/refs/heads and .git/packed-refs to trace how branch names point to commit hashes.",
            commandSnippet: `# Inspect raw branch reference
cat .git/refs/heads/main 2>/dev/null || cat .git/packed-refs
# Inspect recent branch pointer movements
git reflog -n 10`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Confirm branches are merely 41-byte text files pointing to commit SHAs",
              "Use git reflog to locate detached or rebased commit pointers"
            ],
            tags: ["git", "reflog", "refs"]
          }
        ]
      },
      {
        id: "mod-2.2",
        code: "2.2",
        title: "Branching Strategies & PR Workflows",
        description: "Enforce trunk-based development, branch protection rules, commit signing, and pre-commit hooks.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-2.2.1",
            title: "Implement GitHub Flow with strict branch protection rules",
            description: "Configure branch protection mandating linear history, signed commits, and required status checks.",
            commandSnippet: `# Verify branch status and divergence from upstream
git fetch origin main
git log --left-right --graph --cherry-pick --oneline main...feature-branch`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Direct pushes to main branch blocked by protection policy",
              "Pull requests require at least 1 approving review and green CI"
            ],
            tags: ["github", "branching", "pr"]
          },
          {
            id: "task-2.2.2",
            title: "Author commit hooks using pre-commit for lint and secret scanning",
            description: "Install pre-commit framework and configure .pre-commit-config.yaml to scan for secrets before commit.",
            commandSnippet: `# .pre-commit-config.yaml
repos:
- repo: https://github.com/pre-commit/pre-commit-hooks
  rev: v4.4.0
  hooks:
    - id: check-added-large-files
    - id: detect-private-key
    - id: check-yaml`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "pre-commit run --all-files executes in local repository",
              "Attempted commit of private key file is automatically blocked"
            ],
            tags: ["git-hooks", "pre-commit", "security"]
          },
          {
            id: "task-2.2.3",
            title: "Resolve complex 3-way merge conflicts with rerere (reuse recorded resolution)",
            description: "Enable git rerere (reuse recorded resolution) to automatically resolve repeated merge conflicts.",
            commandSnippet: `# Enable git rerere globally
git config --global rerere.enabled true
# Check status of recorded resolutions
git rerere status`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Git automatically reapplies identical conflict resolution across rebases",
              "Reduces manual conflict fatigue during complex rebase operations"
            ],
            tags: ["git", "rerere", "conflicts"]
          },
          {
            id: "task-2.2.4",
            title: "Configure signed commits with GPG/SSH keys for tamper-proof provenance",
            description: "Generate GPG or SSH signing key, configure git user.signingkey, and verify commit signature badge.",
            commandSnippet: `# Configure commit signing using SSH key
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git commit -m "feat: verified signed commit"`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "git log --show-signature displays 'Good signature'",
              "GitHub displays 'Verified' badge on commit"
            ],
            tags: ["gpg", "signing", "provenance"]
          }
        ]
      },
      {
        id: "mod-2.3",
        code: "2.3",
        title: "Advanced Git History Surgery & Recovery",
        description: "Master interactive rebasing, bisect bug hunting, secret scrubbing, and reflog disaster recovery.",
        estimatedHours: 20,
        tasks: [
          {
            id: "task-2.3.1",
            title: "Perform interactive 5-commit rebase with squashing, fixing, and rewording",
            description: "Reorder and squash noisy WIP commits into a single atomic conventional commit message.",
            commandSnippet: `# Interactive rebase against upstream main
git checkout feature-branch
git rebase -i origin/main
# In the editor: mark 4 commits as 'squash' (s) and first as 'reword' (r)
git log --oneline -n 5`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Git log demonstrates clean linear history without redundant merge commits",
              "Conventional commit message format strictly verified (feat: add telemetry)"
            ],
            tags: ["git", "rebase", "git-surgery"]
          },
          {
            id: "task-2.3.2",
            title: "Cherry-pick targeted commits across divergent branches",
            description: "Extract a specific security bugfix commit from a development branch and apply it to release branch.",
            commandSnippet: `# Apply single commit onto current branch without merging branch
git cherry-pick <COMMIT_SHA>`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Target commit changes applied cleanly to destination branch",
              "Original commit author metadata preserved"
            ],
            tags: ["git", "cherry-pick", "workflow"]
          },
          {
            id: "task-2.3.3",
            title: "Recover detached HEAD and pruned commits using git reflog and fsck",
            description: "Restore a lost branch accidentally deleted with git branch -D using reflog pointers.",
            commandSnippet: `# Locate lost commit hash in reflog
git reflog
# Reconstruct branch from commit hash
git branch recovered-work <LOST_COMMIT_SHA>`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Recover all lost commit history and files",
              "git fsck --lost-found confirms no dangling commits lost"
            ],
            tags: ["git", "recovery", "fsck"]
          },
          {
            id: "task-2.3.4",
            title: "Isolate bug introduction commits automatically via git bisect run",
            description: "Execute automated binary search to identify which commit introduced a regression using a test script.",
            commandSnippet: `# Start automated bisect session
git bisect start HEAD v1.0.0
git bisect run npm test
git bisect reset`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "git bisect locates the exact first faulty commit automatically",
              "Halts at the culprit commit with log details"
            ],
            tags: ["git", "bisect", "testing"]
          },
          {
            id: "task-2.3.5",
            title: "Purge leaked production secrets from entire repository history using git-filter-repo",
            description: "Completely purge an accidentally committed .env or credentials file from all historical commits.",
            commandSnippet: `# Install git-filter-repo and scrub sensitive file
git filter-repo --invert-paths --path .env --force`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Target file is absent from every commit in repository history",
              "git log --all --full-history -- '.env' returns 0 results"
            ],
            tags: ["git-filter-repo", "security", "scrubbing"]
          },
          {
            id: "task-2.3.6",
            title: "Manage monorepo dependencies with git submodules and sparse checkout",
            description: "Configure git submodules and clone only specific subdirectories using sparse checkout.",
            commandSnippet: `# Enable sparse checkout to clone only /apps/api
git clone --filter=blob:none --no-checkout <REPO_URL> monorepo
cd monorepo
git sparse-checkout set apps/api
git checkout main`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Working tree contains only specified directory subset",
              "Dramatically reduces clone time and disk footprint"
            ],
            tags: ["git", "sparse-checkout", "monorepo"]
          }
        ]
      }
    ],
    milestones: []
  },

  // ==========================================
  // PHASE 3: Track B - Bash & Python Automation (8 Tasks + 1 Milestone)
  // ==========================================
  {
    id: "phase-3",
    phaseNumber: 3,
    title: "Production Bash & Python Systems Automation",
    subtitle: "Defensive Shell Scripting, Robust Error Trapping, REST CLIs & Cron Daemons",
    duration: "3 Weeks",
    mode: "Parallel Track B",
    trackInfo: "Track B (Evening): Production Bash & Python Automation",
    description:
      "Build production-grade Shell and Python scripting engines with strict error handling, associative arrays, subprocess management, REST health probers, and cron mutex locking.",
    iconName: "Zap",
    rankBadge: "SysAdmin",
    modules: [
      {
        id: "mod-3.1",
        code: "3.1",
        title: "Production Bash Automation & Defensiveness",
        description: "Master bash strict mode, associative arrays, regex matching, and parameter expansion.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-3.1.1",
            title: "Write production-grade bash strict mode boilerplate (set -Eeuo pipefail)",
            description: "Implement parameter expansion, default fallback values, script directory discovery, and exit traps.",
            commandSnippet: `#!/usr/bin/env bash
set -Eeuo pipefail
readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

log_info() { echo -e "\\033[0;32m[INFO] $(date +'%Y-%m-%dT%H:%M:%S%z')\\033[0m: $*"; }
log_err() { echo -e "\\033[0;31m[ERROR] $(date +'%Y-%m-%dT%H:%M:%S%z')\\033[0m: $*" >&2; }

TARGET_ENV="\${1:-production}"
log_info "Initiating deployment cycle for target: \${TARGET_ENV}"`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Unset variables immediately trigger script termination with error",
              "Piped failure in command chain captured by pipefail flag"
            ],
            tags: ["bash", "boilerplate", "automation"]
          },
          {
            id: "task-3.1.2",
            title: "Implement associative arrays, regex matching, and CLI argument parsing via getopts",
            description: "Author a bash script parsing flags (-e environment, -p port, -v verbose) with validation.",
            commandSnippet: `#!/usr/bin/env bash
set -euo pipefail
while getopts "e:p:v" opt; do
  case "\$opt" in
    e) ENV="\$OPTARG" ;;
    p) PORT="\$OPTARG" ;;
    v) VERBOSE=1 ;;
    *) echo "Usage: \$0 -e <env> -p <port> [-v]" && exit 1 ;;
  esac
done`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Script parses named flags cleanly with usage error on missing arguments",
              "Invalid options rejected with exit code 1"
            ],
            tags: ["bash", "getopts", "cli"]
          }
        ]
      },
      {
        id: "mod-3.2",
        code: "3.2",
        title: "Python Systems Automation & Tooling",
        description: "Write Python automation utilities for infrastructure management, REST probing, and JSON transformations.",
        estimatedHours: 18,
        tasks: [
          {
            id: "task-3.2.1",
            title: "Build robust REST API health prober CLI with exponential backoff",
            description: "Construct a python CLI that polls endpoint health with exponential backoff and returns structured status.",
            commandSnippet: `import sys, time, urllib.request, argparse

def check_endpoint(url: str, retries: int = 3, backoff: float = 1.5):
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'DevOpsProbe/1.0'})
            with urllib.request.urlopen(req, timeout=5) as res:
                if res.status == 200:
                    print(f"[OK] {url} responded 200 in attempt {attempt}")
                    return 0
        except Exception as e:
            print(f"[WARN] Attempt {attempt}/{retries} failed: {e}")
            time.sleep(backoff ** attempt)
    return 1

if __name__ == '__main__':
    sys.exit(check_endpoint(sys.argv[1]))`,
            snippetLanguage: "python",
            acceptanceCriteria: [
              "Script terminates with status code 0 on healthy 200 responses",
              "Exponential backoff delays successive attempts upon failure"
            ],
            tags: ["python", "automation", "rest"]
          },
          {
            id: "task-3.2.2",
            title: "Parse and transform complex nested JSON payloads via Python standard library",
            description: "Read large telemetry JSON files, filter nodes by criteria, and output flattened CSV summary.",
            commandSnippet: `import json, csv, sys

with open(sys.argv[1]) as f:
    data = json.load(f)

# Flatten and extract metrics
with open('summary.csv', 'w', newline='') as out:
    writer = csv.writer(out)
    writer.writerow(['host', 'cpu_percent', 'memory_used_mb'])
    for node in data.get('nodes', []):
        writer.writerow([node['id'], node['cpu'], node['ram']])`,
            snippetLanguage: "python",
            acceptanceCriteria: [
              "Script reads and parses nested JSON without third-party dependencies",
              "Outputs valid CSV with header columns"
            ],
            tags: ["python", "json", "csv"]
          },
          {
            id: "task-3.2.3",
            title: "Execute shell subprocesses safely with timeouts, stdout capture & error checking",
            description: "Invoke shell commands via subprocess.run, check return codes, and capture stdout/stderr separately.",
            commandSnippet: `import subprocess

res = subprocess.run(
    ['df', '-h', '/'],
    capture_output=True,
    text=True,
    timeout=5,
    check=True
)
print("Filesystem output:", res.stdout.strip())`,
            snippetLanguage: "python",
            acceptanceCriteria: [
              "subprocess terminates on timeout if command hangs",
              "Non-zero exit codes raise CalledProcessError cleanly"
            ],
            tags: ["python", "subprocess", "os"]
          },
          {
            id: "task-3.2.4",
            title: "Package Python automation CLI tool with virtualenv and pyproject.toml",
            description: "Package command-line tool with console_scripts entry point and isolate dependencies in virtual environment.",
            commandSnippet: `# Create isolated venv and install packaging tools
python3 -m venv .venv
source .venv/bin/activate
pip install build setuptools`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Virtual environment isolates tool from host Python libraries",
              "CLI executable accessible in PATH"
            ],
            tags: ["python", "virtualenv", "packaging"]
          }
        ]
      },
      {
        id: "mod-3.3",
        code: "3.3",
        title: "Cron & Scheduled Automation",
        description: "Schedule automated infrastructure maintenance scripts with concurrency control and logging.",
        estimatedHours: 12,
        tasks: [
          {
            id: "task-3.3.1",
            title: "Configure idempotent crontab jobs with flock mutex locking",
            description: "Prevent overlapping cron job execution runs using flock file descriptor locking.",
            commandSnippet: `# Crontab entry with flock mutex lock
# Run backup script every 15 minutes, prevent overlapping runs
*/15 * * * * /usr/bin/flock -n /var/lock/backup.lock /usr/local/bin/backup-job.sh >> /var/log/backup.log 2>&1`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "If previous run takes longer than 15 minutes, subsequent cron invocation skips gracefully",
              "No lockfile collisions or orphaned stale processes"
            ],
            tags: ["cron", "flock", "concurrency"]
          },
          {
            id: "task-3.3.2",
            title: "Implement centralized log rotation for automated script outputs",
            description: "Deploy an /etc/logrotate.d/ configuration for custom automation tool output logs.",
            commandSnippet: `# /etc/logrotate.d/automation-tasks
/var/log/backup.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}`,
            snippetLanguage: "ini",
            acceptanceCriteria: [
              "logrotate -d /etc/logrotate.d/automation-tasks validates syntax without errors",
              "Logs compressed and rotated with maximum 7 retention cycles"
            ],
            tags: ["logrotate", "logging", "maintenance"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-2-3",
        title: "Log Archive Tool (log-archive.sh)",
        slug: "log-archive-tool",
        description:
          "Create a production bash CLI tool log-archive.sh that accepts a target log directory (e.g. /var/log), compresses logs older than N days into a tar.gz archive named logs_archive_YYYYMMDD_HHMMSS.tar.gz, moves it to an archive directory, and logs the operation to /var/log/archive_history.log.",
        deliverables: [
          "log-archive.sh accepting directory argument and optional retention flag",
          "Automated generation of timestamped tar.gz archive",
          "Timestamped audit trail record appended to archive_history.log",
          "Crontab schedule entry running the script every midnight"
        ],
        codeTemplate: `#!/usr/bin/env bash
# log-archive.sh - Automated log archival CLI
set -Eeuo pipefail

LOG_DIR="\${1:?Error: Specify source log directory (e.g. /var/log/nginx)}"
ARCHIVE_DEST="\${2:-/var/log/archive}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="logs_archive_\${TIMESTAMP}.tar.gz"

mkdir -p "$ARCHIVE_DEST"
tar -czf "\${ARCHIVE_DEST}/\${ARCHIVE_NAME}" -C "$LOG_DIR" .
echo "[\$(date -u)] Archived \${LOG_DIR} to \${ARCHIVE_DEST}/\${ARCHIVE_NAME}" >> /var/log/archive_history.log
echo "Successfully created: \${ARCHIVE_DEST}/\${ARCHIVE_NAME}"`,
        language: "bash",
        verificationCommand: "./log-archive.sh /var/log/nginx /var/log/archive"
      }
    ]
  },

  // ==========================================
  // PHASE 4: 9 Tasks + 2 Milestones
  // ==========================================
  {
    id: "phase-4",
    phaseNumber: 4,
    title: "Web Servers, Proxies, TLS & SSH Hardening",
    subtitle: "Nginx Reverse Proxying, Rate Limiting, Let's Encrypt & Fail2ban",
    duration: "2 Weeks",
    mode: "Sequential",
    description:
      "Configure enterprise Nginx reverse proxies with SSL/TLS termination, HTTP/2 multiplexing, caching headers, rate limiting, and harden remote SSH infrastructure with fail2ban.",
    iconName: "ShieldCheck",
    rankBadge: "SysAdmin",
    modules: [
      {
        id: "mod-4.1",
        code: "4.1",
        title: "SSH Remote Server Hardening & Bastions",
        description: "Lock down sshd_config against brute-force attacks, disable password authentication, and configure Fail2ban jails.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-4.1.1",
            title: "Generate and deploy Ed25519 cryptographic keypairs with passphrase",
            description: "Create modern Ed25519 SSH keys and deploy public key to target host authorized_keys.",
            commandSnippet: `# Generate Ed25519 key with custom comment
ssh-keygen -t ed25519 -a 100 -C "admin@production-fleet" -f ~/.ssh/id_ed25519_prod
# Copy public key to remote host
ssh-copy-id -i ~/.ssh/id_ed25519_prod.pub -p 22 deployer@server.internal`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Private key protected by strong passphrase",
              "authorized_keys permissions restricted to 600 and .ssh to 700"
            ],
            tags: ["ssh", "ed25519", "keys"]
          },
          {
            id: "task-4.1.2",
            title: "Harden /etc/ssh/sshd_config (disable password auth, root login & set custom port)",
            description: "Disable root login, disable PasswordAuthentication, set custom SSH port, and limit MaxAuthTries.",
            commandSnippet: `# /etc/ssh/sshd_config.d/99-hardened.conf
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2`,
            snippetLanguage: "ini",
            acceptanceCriteria: [
              "Password login rejected for all users",
              "Root login strictly forbidden over network socket"
            ],
            tags: ["sshd", "security", "hardening"]
          },
          {
            id: "task-4.1.3",
            title: "Configure Fail2ban intrusion detection jail for SSH brute force protection",
            description: "Install fail2ban, configure jail.local, and verify IP ban triggers on 3 failed attempts.",
            commandSnippet: `# /etc/fail2ban/jail.d/sshd.local
[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 600
bantime = 3600`,
            snippetLanguage: "ini",
            acceptanceCriteria: [
              "fail2ban-client status sshd shows jail active",
              "Failed attempts over limit result in iptables REJECT rule inserted"
            ],
            tags: ["fail2ban", "security", "firewall"]
          },
          {
            id: "task-4.1.4",
            title: "Set up SSH Jump Host / Bastion ProxyJump configuration in ~/.ssh/config",
            description: "Route SSH connections to private subnet instances through a dedicated bastion jump box.",
            commandSnippet: `# ~/.ssh/config
Host bastion
  HostName 203.0.113.10
  User ec2-user
  IdentityFile ~/.ssh/id_ed25519_prod

Host 10.0.*.*
  ProxyJump bastion
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519_prod`,
            snippetLanguage: "ini",
            acceptanceCriteria: [
              "Direct connection to private IP 10.0.1.5 succeeds via ProxyJump",
              "No private keys stored on intermediate bastion host"
            ],
            tags: ["ssh", "bastion", "proxyjump"]
          }
        ]
      },
      {
        id: "mod-4.2",
        code: "4.2",
        title: "Nginx Reverse Proxy, Load Balancing & TLS",
        description: "Deploy production Nginx configurations with proxy_pass, upstream pools, SSL ciphers, and rate limiting.",
        estimatedHours: 18,
        tasks: [
          {
            id: "task-4.2.1",
            title: "Deploy Nginx reverse proxy with proxy_pass and header forwarding",
            description: "Configure proxy_pass to forward client traffic with Host, X-Real-IP, and X-Forwarded-For headers.",
            commandSnippet: `location /api/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`,
            snippetLanguage: "nginx",
            acceptanceCriteria: [
              "Backend application receives genuine client IP in X-Real-IP header",
              "Subpath /api/ cleanly mapped to backend service"
            ],
            tags: ["nginx", "reverse-proxy", "http"]
          },
          {
            id: "task-4.2.2",
            title: "Configure upstream load balancing pools with least_conn and health checks",
            description: "Distribute incoming traffic across multiple backend worker nodes using least_conn algorithm.",
            commandSnippet: `upstream backend_api {
    least_conn;
    server 127.0.0.1:8001 max_fails=3 fail_timeout=10s;
    server 127.0.0.1:8002 max_fails=3 fail_timeout=10s;
}`,
            snippetLanguage: "nginx",
            acceptanceCriteria: [
              "Traffic distributed between backend nodes 8001 and 8002",
              "Failed backend automatically pulled from pool during timeout"
            ],
            tags: ["nginx", "load-balancer", "upstream"]
          },
          {
            id: "task-4.2.3",
            title: "Implement rate limiting zones to prevent API DoS attacks (limit_req)",
            description: "Define limit_req_zone in nginx.conf to throttle clients exceeding 10 requests per second.",
            commandSnippet: `# In http block
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# In location block
location /login {
    limit_req zone=api_limit burst=5 nodelay;
    proxy_pass http://backend_api;
}`,
            snippetLanguage: "nginx",
            acceptanceCriteria: [
              "Excessive client requests over threshold return HTTP 429 or 503",
              "Bursts within threshold permitted without delay"
            ],
            tags: ["nginx", "rate-limit", "security"]
          },
          {
            id: "task-4.2.4",
            title: "Configure modern TLS 1.3 encryption, HTTP/2, and secure ciphers",
            description: "Deploy SSL server block with TLSv1.2 and TLSv1.3 protocols, HSTS, and disable weak ciphers.",
            commandSnippet: `server {
    listen 443 ssl http2;
    server_name api.infra.internal;

    ssl_certificate /etc/letsencrypt/live/api.infra.internal/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.infra.internal/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}`,
            snippetLanguage: "nginx",
            acceptanceCriteria: [
              "SSL Labs scan scores A+ security rating",
              "HSTS header present in all HTTPS responses"
            ],
            tags: ["tls", "https", "hsts"]
          },
          {
            id: "task-4.2.5",
            title: "Automate Let's Encrypt SSL certificate issuance and renewal via Certbot",
            description: "Install certbot with python3-certbot-nginx plugin and configure automated dry-run renewal test.",
            commandSnippet: `# Request certificate via Certbot Nginx plugin
sudo certbot --nginx -d api.infra.internal --non-interactive --agree-tos -m admin@infra.internal
# Test automated cron renewal
sudo certbot renew --dry-run`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Certbot issues valid Let's Encrypt certificate and injects Nginx blocks",
              "Systemd certbot.timer dry-run renewal succeeds"
            ],
            tags: ["certbot", "letsencrypt", "ssl"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-4.1",
        title: "SSH Remote Server Setup & Non-Root Hardening",
        slug: "ssh-remote-server-setup",
        description:
          "Provision a remote Linux instance, configure a dedicated sudo user, generate an Ed25519 keypair, copy public keys via ssh-copy-id, change default SSH port to 2222, and disable password authentication entirely.",
        deliverables: [
          "Ed25519 private/public keypair stored securely in ~/.ssh",
          "Tested SSH connection via ssh -p 2222 -i ~/.ssh/id_ed25519 deployer@host",
          "Verification that ssh root@host fails with Permission Denied"
        ],
        codeTemplate: `# Generate hardened Ed25519 keypair
ssh-keygen -t ed25519 -C "deployer@mastery-cluster" -f ~/.ssh/id_ed25519_deployer
ssh-copy-id -i ~/.ssh/id_ed25519_deployer.pub -p 22 deployer@<SERVER_IP>`,
        language: "bash",
        verificationCommand: "ssh -p 2222 -o PasswordAuthentication=no deployer@<SERVER_IP> 'whoami'"
      },
      {
        id: "ms-4.2",
        title: "Nginx Log Analyser Tool (nginx-log-analyser.sh)",
        slug: "nginx-log-analyser",
        description:
          "Build an automated CLI tool nginx-log-analyser.sh that parses Nginx combined access.log files, extracting Top 5 IP addresses by request count, Top 5 most requested paths, Top 5 HTTP response status codes, and Top 5 User Agents.",
        deliverables: [
          "Bash script utilizing awk, sort, and uniq with formatted output columns",
          "Handling of large access log files without high memory consumption",
          "Summary percentage of 4xx and 5xx error responses"
        ],
        codeTemplate: `#!/usr/bin/env bash
# nginx-log-analyser.sh - Access log analytics
set -euo pipefail

LOG_FILE="\${1:?Usage: $0 /path/to/access.log}"

echo "=== TOP 5 IP ADDRESSES ==="
awk '{print $1}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -n 5

echo -e "\\n=== TOP 5 REQUESTED PATHS ==="
awk '{print $7}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -n 5

echo -e "\\n=== TOP 5 RESPONSE STATUS CODES ==="
awk '{print $9}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -n 5`,
        language: "bash",
        verificationCommand: "./nginx-log-analyser.sh /var/log/nginx/access.log"
      }
    ]
  },

  // ==========================================
  // PHASE 5: 14 Tasks + 2 Milestones
  // ==========================================
  {
    id: "phase-5",
    phaseNumber: 5,
    title: "Container Architecture & Docker Deep-Dive",
    subtitle: "Kernel Namespaces, Multi-Stage Builds, Bridge Networks & Hardening",
    duration: "3 Weeks",
    mode: "Sequential",
    description:
      "Deconstruct Linux namespaces and cgroups underneath container runtimes, author minimal multi-stage OCI images, orchestrate multi-tier Docker Compose stacks, and apply Trivy vulnerability scans.",
    iconName: "Box",
    rankBadge: "Cloud Architect",
    modules: [
      {
        id: "mod-5.1",
        code: "5.1",
        title: "Container Runtimes & Linux Isolation Primitives",
        description: "Explore PID, NET, MNT, IPC, and UTS namespaces using unshare and inspect cgroups v2 resource controllers.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-5.1.1",
            title: "Simulate container isolation using unshare, chroot, and mount namespaces",
            description: "Spawn an isolated shell process with dedicated PID and mount namespaces without using Docker.",
            commandSnippet: `# Create isolated namespace with its own PID table and mount points
sudo unshare --fork --pid --mount-proc --uts /bin/bash
hostname isolated-node
hostname # Verify change does not affect host system`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "ps aux inside isolated shell displays only PID 1 (isolated shell)",
              "Host hostname remains unaffected by container hostname change"
            ],
            tags: ["namespaces", "cgroups", "containers"]
          },
          {
            id: "task-5.1.2",
            title: "Inspect and enforce cgroups v2 memory and CPU constraints directly in /sys/fs/cgroup",
            description: "Create custom control group folder and limit memory to 100MB to test kernel OOM termination.",
            commandSnippet: `# Create test cgroup
sudo mkdir -p /sys/fs/cgroup/sandbox
echo "100M" | sudo tee /sys/fs/cgroup/sandbox/memory.max
# Run process attached to cgroup
echo $$ | sudo tee /sys/fs/cgroup/sandbox/cgroup.procs`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Process exceeding 100MB is killed by kernel OOM killer",
              "cgroup.events records oom_kill count increment"
            ],
            tags: ["cgroups", "kernel", "memory"]
          }
        ]
      },
      {
        id: "mod-5.2",
        code: "5.2",
        title: "Docker Engine Architecture & CLI",
        description: "Configure Docker daemon daemon.json, container lifecycles, and storage reclamation.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-5.2.1",
            title: "Configure Docker daemon daemon.json with custom log drivers and storage limits",
            description: "Configure /etc/docker/daemon.json with json-file max-size and max-file rotation.",
            commandSnippet: `# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  },
  "live-restore": true
}`,
            snippetLanguage: "json",
            acceptanceCriteria: [
              "Docker daemon restarts cleanly with live-restore enabled",
              "Container logs automatically capped at 50MB with 3 rotations"
            ],
            tags: ["docker", "daemon", "storage"]
          },
          {
            id: "task-5.2.2",
            title: "Manage container lifecycles, exec inspection, and resource stats",
            description: "Inspect live container metrics (CPU, RAM, Net I/O) using docker stats and docker top.",
            commandSnippet: `# Stream real-time container resource telemetry
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Real-time streaming stats for running containers",
              "Inspect underlying container process IDs via docker top"
            ],
            tags: ["docker", "stats", "monitoring"]
          },
          {
            id: "task-5.2.3",
            title: "Clean unused images, build caches, and dangling volumes via docker system prune",
            description: "Reclaim host disk space safely by purging dangling layers and stopped containers.",
            commandSnippet: `# Purge stopped containers, unused networks, and build caches
docker system prune -af --volumes`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Dangling volumes and untagged images purged",
              "Report output shows reclaimed disk space in GB"
            ],
            tags: ["docker", "prune", "maintenance"]
          }
        ]
      },
      {
        id: "mod-5.3",
        code: "5.3",
        title: "Production Multi-Stage Dockerfiles",
        description: "Author multi-stage Dockerfiles utilizing Alpine or Distroless bases, layer caching, and non-root users.",
        estimatedHours: 18,
        tasks: [
          {
            id: "task-5.3.1",
            title: "Author lean multi-stage build separating compiler artifacts from runtime",
            description: "Design a builder stage that compiles binaries, followed by an ultra-lean runtime stage (<30MB).",
            commandSnippet: `# syntax=docker/dockerfile:1.4
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

FROM alpine:3.19 AS runner
WORKDIR /
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]`,
            snippetLanguage: "dockerfile",
            acceptanceCriteria: [
              "Final image size is less than 30MB",
              "No compiler or development packages present in final runner image"
            ],
            tags: ["docker", "multi-stage", "optimization"]
          },
          {
            id: "task-5.3.2",
            title: "Optimize Docker layer caching order to accelerate CI build iterations",
            description: "Order Dockerfile instructions such that dependency manifests (package.json/go.mod) are copied before source.",
            commandSnippet: `# Cache dependencies layer first
COPY package*.json ./
RUN npm ci --only=production
# Source code copied afterwards
COPY . .
RUN npm run build`,
            snippetLanguage: "dockerfile",
            acceptanceCriteria: [
              "Rebuilding without dependency changes reuses cached layer in <2s",
              "Build time reduced by >70% during application code changes"
            ],
            tags: ["docker", "caching", "ci"]
          },
          {
            id: "task-5.3.3",
            title: "Deploy unprivileged non-root users (USER nonroot) in production containers",
            description: "Create a dedicated system user and group inside container and switch execution context away from root.",
            commandSnippet: `RUN addgroup -S -g 10001 appgroup && adduser -S -u 10001 -G appgroup appuser
USER 10001:10001`,
            snippetLanguage: "dockerfile",
            acceptanceCriteria: [
              "docker run --rm <image> whoami returns appuser or UID 10001",
              "Container has no root privileges inside the container namespace"
            ],
            tags: ["docker", "security", "non-root"]
          },
          {
            id: "task-5.3.4",
            title: "Use Google Distroless minimal base images to eliminate package managers",
            description: "Deploy production binary into gcr.io/distroless/static:nonroot with zero shells or package managers.",
            commandSnippet: `FROM gcr.io/distroless/static:nonroot
COPY --from=builder /app/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]`,
            snippetLanguage: "dockerfile",
            acceptanceCriteria: [
              "docker exec -it <container> sh fails (no shell available)",
              "Attack surface minimized with zero extraneous binaries"
            ],
            tags: ["distroless", "security", "containers"]
          }
        ]
      },
      {
        id: "mod-5.4",
        code: "5.4",
        title: "Container Networking & Storage Volumes",
        description: "Design custom bridge networks, DNS service discovery, named volumes, and host mounts.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-5.4.1",
            title: "Create user-defined bridge networks with automatic container DNS resolution",
            description: "Connect isolated containers across an isolated subnet with automatic container name DNS resolution.",
            commandSnippet: `# Create dedicated bridge network
docker network create --driver bridge --subnet 172.28.0.0/16 isolated-net
docker run -d --name redis-cache --network isolated-net redis:7-alpine`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Containers communicate via DNS hostname without static IP addressing",
              "External host cannot directly probe internal subnet IP"
            ],
            tags: ["docker", "networking", "dns"]
          },
          {
            id: "task-5.4.2",
            title: "Mount named volumes with specific permissions and backup volume contents",
            description: "Create persistent Docker volume and archive its contents to tar.gz on the host.",
            commandSnippet: `# Backup named volume contents
docker run --rm -v db_data:/volume -v $(pwd):/backup alpine tar -czf /backup/db_backup.tar.gz -C /volume .`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Data inside named volume backed up without stopping database",
              "Volume restoration test extracts cleanly"
            ],
            tags: ["docker", "volumes", "backup"]
          },
          {
            id: "task-5.4.3",
            title: "Configure host bind mounts for rapid local development hot-reloading",
            description: "Mount local source code directory into container with read-write permissions.",
            commandSnippet: `docker run -d -p 3000:3000 -v $(pwd):/app -v /app/node_modules node:20-alpine npm run dev`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Edits on host machine immediately reflect inside running container",
              "node_modules preserved inside container layer"
            ],
            tags: ["docker", "bind-mount", "dx"]
          }
        ]
      },
      {
        id: "mod-5.5",
        code: "5.5",
        title: "Multi-Container Stacks & Security",
        description: "Compose multi-tier stacks with healthchecks and run static vulnerability analysis with Trivy.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-5.5.1",
            title: "Orchestrate 3-tier microservice stack with Docker Compose and healthchecks",
            description: "Author compose.yaml utilizing service_healthy condition on depends_on to prevent premature web worker startup.",
            commandSnippet: `services:
  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app_prod
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  web:
    build: .
    depends_on:
      database:
        condition: service_healthy
    ports:
      - "8080:8080"`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "docker compose up -d waits for Postgres health probe before launching web",
              "Stack launches cleanly with zero connection dropouts"
            ],
            tags: ["compose", "healthchecks", "postgres"]
          },
          {
            id: "task-5.5.2",
            title: "Scan container images for CVEs using Trivy in local build workflow",
            description: "Integrate Trivy CLI into build scripts to block deployment of images containing unfixed vulnerabilities.",
            commandSnippet: `# Scan local container image with Trivy and exit with error on CRITICAL
trivy image --severity HIGH,CRITICAL --exit-code 1 --ignore-unfixed my-app:production`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Trivy scan returns zero unpatched CRITICAL vulnerabilities",
              "Build halts with exit code 1 if critical security CVE is detected"
            ],
            tags: ["trivy", "cve", "security"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-5.1",
        title: "Production Lean Dockerfile",
        slug: "production-lean-dockerfile",
        description:
          "Author a multi-stage Dockerfile for a real web application (Node.js/Go/Python) that incorporates layer caching (package.json before source code), non-root execution (chown/USER), minimal base image (Alpine/Distroless), and .dockerignore filtering.",
        deliverables: [
          "Optimized Dockerfile producing an image under 50MB",
          "Comprehensive .dockerignore excluding .git, node_modules, and test files",
          "Trivy scan report showing zero CRITICAL vulnerabilities"
        ],
        codeTemplate: `# Production Lean Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S -g 1001 appgroup && adduser -S -u 1001 -G appgroup appuser
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
        language: "dockerfile",
        verificationCommand: "docker build -t app:prod . && docker images app:prod"
      },
      {
        id: "ms-5.2",
        title: "Multi-Container Stack Deployment",
        slug: "multi-container-stack",
        description:
          "Deploy a 3-tier container stack via Docker Compose consisting of Nginx (Reverse proxy / SSL termination), Web API, and Redis Cache. All containers must exist on an internal bridge network with persistent volume storage.",
        deliverables: [
          "docker-compose.yml with healthchecks, environment variables, and persistent volumes",
          "Nginx configuration routing requests to the API backend",
          "Verification of end-to-end connectivity and cache persistence across compose restarts"
        ],
        codeTemplate: `version: "3.8"
services:
  proxy:
    image: nginx:alpine
    ports: ["80:80"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf:ro"]
    depends_on: ["api"]
  api:
    build: ./api
    environment:
      REDIS_HOST: cache
    depends_on: ["cache"]
  cache:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]
volumes:
  redis_data:`,
        language: "yaml",
        verificationCommand: "docker compose up -d && curl -i http://localhost"
      }
    ]
  },

  // ==========================================
  // PHASE 6: Track A - AWS Cloud Infrastructure (13 Tasks)
  // ==========================================
  {
    id: "phase-6",
    phaseNumber: 6,
    title: "AWS Cloud Infrastructure Architecture",
    subtitle: "IAM Least Privilege, Custom Multi-AZ VPCs, Security Groups & EC2 Fleet",
    duration: "4 Weeks",
    mode: "Parallel Track A",
    trackInfo: "Track A (Morning): AWS Cloud Infrastructure Architecture",
    description:
      "Design highly available AWS VPC topologies across multiple Availability Zones, formulate least-privilege IAM policies, configure security group chaining, and automate EC2 provisioning via user data.",
    iconName: "Cloud",
    rankBadge: "Cloud Architect",
    modules: [
      {
        id: "mod-6.1",
        code: "6.1",
        title: "AWS Global Infrastructure & Foundation",
        description: "Configure AWS CLI profiles, multi-account structures, and CloudWatch billing alerts.",
        estimatedHours: 12,
        tasks: [
          {
            id: "task-6.1.1",
            title: "Configure AWS CLI profiles, default regions, and credentials securely",
            description: "Set up ~/.aws/credentials and ~/.aws/config with named profiles and session tokens.",
            commandSnippet: `# Configure AWS CLI named profile
aws configure --profile prod-engineer
aws sts get-caller-identity --profile prod-engineer`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "aws sts get-caller-identity verifies active Account ID and User ARN",
              "Credentials stored securely in ~/.aws/credentials with 600 permissions"
            ],
            tags: ["aws", "cli", "iam"]
          },
          {
            id: "task-6.1.2",
            title: "Configure AWS Organizations SCPs and Billing Alarm thresholds via CloudWatch",
            description: "Set up a CloudWatch metric alarm tracking EstimatedCharges with SNS email alert.",
            commandSnippet: `# Create CloudWatch billing alarm at $50 threshold
aws cloudwatch put-metric-alarm \\
  --alarm-name "MonthlyBillingThreshold" \\
  --metric-name EstimatedCharges \\
  --namespace AWS/Billing \\
  --statistic Maximum \\
  --period 21600 \\
  --threshold 50 \\
  --comparison-operator GreaterThanThreshold`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Alarm state reflects OK when charges under threshold",
              "SNS notification dispatches email alert if spend exceeds $50"
            ],
            tags: ["cloudwatch", "billing", "aws"]
          },
          {
            id: "task-6.1.3",
            title: "Enable AWS CloudTrail across all regions for compliance auditing",
            description: "Create an organization multi-region CloudTrail trail logging management and S3 data events.",
            commandSnippet: `# Create multi-region CloudTrail
aws cloudtrail create-trail --name "org-audit-trail" --s3-bucket-name "company-audit-logs" --is-multi-region-trail
aws cloudtrail start-logging --name "org-audit-trail"`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "CloudTrail logs write to encrypted S3 bucket",
              "Log integrity validation enabled"
            ],
            tags: ["cloudtrail", "compliance", "security"]
          }
        ]
      },
      {
        id: "mod-6.2",
        code: "6.2",
        title: "Identity & Access Management (IAM)",
        description: "Enforce least-privilege IAM policies, assume-role STS delegations, and MFA policies.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-6.2.1",
            title: "Formulate least-privilege IAM policies with strict Resource ARNs & Conditions",
            description: "Author an IAM policy JSON granting S3 PutObject access restricted to a single bucket prefix and source IP.",
            commandSnippet: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::production-app-assets/uploads/*",
      "Condition": {
        "Bool": { "aws:SecureTransport": "true" }
      }
    }
  ]
}`,
            snippetLanguage: "json",
            acceptanceCriteria: [
              "aws:SecureTransport condition strictly mandates TLS (HTTPS)",
              "Access outside /uploads/* prefix is denied by default"
            ],
            tags: ["iam", "policies", "security"]
          },
          {
            id: "task-6.2.2",
            title: "Configure IAM Roles for EC2 instance profiles and OIDC federated identities",
            description: "Create an IAM role for EC2 instances allowing them to read SSM parameters without static keys.",
            commandSnippet: `# Attach AmazonSSMManagedInstanceCore to EC2 role
aws iam attach-role-policy --role-name EC2-App-Role --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam create-instance-profile --instance-profile-name EC2-App-Profile
aws iam add-role-to-instance-profile --instance-profile-name EC2-App-Profile --role-name EC2-App-Role`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "EC2 instance profile permits SSM Session Manager login with zero open SSH ports",
              "Instance can query AWS APIs using ephemeral instance metadata tokens"
            ],
            tags: ["iam", "roles", "ssm"]
          },
          {
            id: "task-6.2.3",
            title: "Enforce Multi-Factor Authentication (MFA) and access key rotation policies",
            description: "Author an IAM policy requiring MFA validation before any AWS API action can be invoked.",
            commandSnippet: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BlockNonMFAActions",
      "Effect": "Deny",
      "NotAction": ["iam:CreateVirtualMFADevice", "iam:EnableMFADevice", "iam:GetUser"],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": { "aws:MultiFactorAuthPresent": "false" }
      }
    }
  ]
}`,
            snippetLanguage: "json",
            acceptanceCriteria: [
              "Users without MFA blocked from reading or writing cloud resources",
              "Enforces compliance across all console and CLI users"
            ],
            tags: ["iam", "mfa", "security"]
          }
        ]
      },
      {
        id: "mod-6.3",
        code: "6.3",
        title: "Networking: Custom VPC, Subnets & Routing",
        description: "Architect a custom VPC with public and private subnets across multiple Availability Zones, IGW, and NAT Gateways.",
        estimatedHours: 20,
        tasks: [
          {
            id: "task-6.3.1",
            title: "Architect multi-AZ VPC with calculated CIDR allocations for subnets",
            description: "Segment a /16 VPC into four /20 subnets: 2 public subnets for ALBs and 2 private subnets for compute instances.",
            commandSnippet: `# VPC: 10.0.0.0/16
# Public Subnet AZ-A:  10.0.0.0/20
# Public Subnet AZ-B:  10.0.16.0/20
# Private Subnet AZ-A: 10.0.32.0/20
# Private Subnet AZ-B: 10.0.48.0/20`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Subnets distributed symmetrically across at least two distinct Availability Zones",
              "Private subnets have no direct route to Internet Gateway"
            ],
            tags: ["vpc", "cidr", "networking"]
          },
          {
            id: "task-6.3.2",
            title: "Deploy Internet Gateway and public route tables for external ingress",
            description: "Create and attach an Internet Gateway to the VPC and associate a default route (0.0.0.0/0) to public subnets.",
            commandSnippet: `# Create and attach IGW
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
# Add route to public route table
aws ec2 create-route --route-table-id $PUB_RT_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Public subnets route 0.0.0.0/0 to Internet Gateway",
              "Instances with public IPs in public subnets are reachable from internet"
            ],
            tags: ["vpc", "igw", "routing"]
          },
          {
            id: "task-6.3.3",
            title: "Provision Elastic IPs and NAT Gateways for private subnet egress",
            description: "Deploy a managed NAT Gateway in the public subnet and point private subnet route tables to it.",
            commandSnippet: `# Allocate EIP and create NAT Gateway
EIP_ALLOC=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
NAT_ID=$(aws ec2 create-nat-gateway --subnet-id $PUB_SUBNET_ID --allocation-id $EIP_ALLOC --query 'NatGateway.NatGatewayId' --output text)
# Point private route table default route to NAT
aws ec2 create-route --route-table-id $PRIV_RT_ID --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_ID`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Private subnet instances can download packages from internet (apt/yum)",
              "Inbound connections from internet to private subnets remain completely blocked"
            ],
            tags: ["nat", "vpc", "egress"]
          },
          {
            id: "task-6.3.4",
            title: "Configure VPC Flow Logs and Network ACLs (NACLs) for subnet perimeter defense",
            description: "Publish VPC network traffic metadata to CloudWatch Logs and establish stateless subnet NACLs.",
            commandSnippet: `# Enable VPC flow logs sending to CloudWatch
aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC_ID --traffic-type ALL --log-group-name /aws/vpc/flow-logs --deliver-logs-permission-arn $ROLE_ARN`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "VPC Flow Logs actively streaming ACCEPT and REJECT packet records to CloudWatch",
              "NACLs restrict rogue port traffic at subnet boundary"
            ],
            tags: ["flow-logs", "nacl", "security"]
          }
        ]
      },
      {
        id: "mod-6.4",
        code: "6.4",
        title: "Compute, Storage & Security Groups",
        description: "Configure stateful security group rules, provision EBS GP3 volumes, and craft EC2 user-data bootstrapping.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-6.4.1",
            title: "Provision hardened EC2 instances with cloud-init user data automation",
            description: "Author a bash user-data script that automatically updates packages, installs Docker, and starts telemetry agent.",
            commandSnippet: `#!/bin/bash
# EC2 User Data Bootstrap
set -euo pipefail
yum update -y
yum install -y docker
systemctl enable --now docker
usermod -aG docker ec2-user
docker run -d --restart always -p 80:80 nginx:alpine`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Instance initiates and serves HTTP traffic on port 80 upon boot",
              "Boot logs recorded in /var/log/cloud-init-output.log"
            ],
            tags: ["ec2", "cloud-init", "aws"]
          },
          {
            id: "task-6.4.2",
            title: "Configure chained Security Groups restricting ingress to ALB source groups",
            description: "Chain security groups so that private EC2 instances accept HTTP port 80 traffic ONLY from the ALB security group.",
            commandSnippet: `# Ingress from ALB security group only
aws ec2 authorize-security-group-ingress \\
  --group-id sg-compute \\
  --protocol tcp \\
  --port 80 \\
  --source-group sg-alb`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Direct external probes to EC2 private port fail",
              "ALB successfully forwards traffic to target instance healthcheck"
            ],
            tags: ["security-groups", "alb", "firewall"]
          },
          {
            id: "task-6.4.3",
            title: "Provision encrypted EBS GP3 volumes and configure S3 bucket policies",
            description: "Configure KMS server-side encryption by default on EBS volumes and block public access on S3 buckets.",
            commandSnippet: `# Enable EBS encryption by default for region
aws ec2 enable-ebs-encryption-by-default
# Put S3 Public Access Block
aws s3api put-public-access-block \\
  --bucket production-assets-vault \\
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "All newly created EBS volumes automatically encrypted with AWS KMS",
              "S3 bucket denies public read or write access globally"
            ],
            tags: ["ebs", "s3", "encryption"]
          }
        ]
      }
    ],
    milestones: []
  },

  // ==========================================
  // PHASE 7: Track B - GitHub Actions CI/CD (8 Tasks + 2 Milestones)
  // ==========================================
  {
    id: "phase-7",
    phaseNumber: 7,
    title: "Automated CI/CD Delivery with GitHub Actions",
    subtitle: "CI Pipelines, Matrix Builds, Caching, OCI Registry Publishing & CD Rollbacks",
    duration: "4 Weeks",
    mode: "Parallel Track B",
    trackInfo: "Track B (Evening): Automated CI/CD Delivery with GitHub Actions",
    description:
      "Construct automated multi-job CI/CD workflows featuring dependency caching, matrix runtime validation, OCI container publishing to GHCR, and zero-downtime deployment pipelines.",
    iconName: "Activity",
    rankBadge: "Cloud Architect",
    modules: [
      {
        id: "mod-7.1",
        code: "7.1",
        title: "Continuous Integration Foundations",
        description: "Author multi-job GitHub Actions workflows running parallel lint, unit tests, and security scans on PRs.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-7.1.1",
            title: "Author .github/workflows/ci.yml with pull request trigger gates",
            description: "Create .github/workflows/ci.yml running parallel lint, unit tests, and security scans on pull requests.",
            commandSnippet: `name: Continuous Integration
on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "PRs trigger automated execution on commit push",
              "Failing test marks PR status check as red"
            ],
            tags: ["github-actions", "ci", "testing"]
          },
          {
            id: "task-7.1.2",
            title: "Configure GitHub repository secrets and environment protection rules",
            description: "Configure staging and production environments with manual reviewer approvals and scoped secrets.",
            commandSnippet: `# Access secrets securely in workflow step
env:
  API_SECRET: \${{ secrets.API_PRODUCTION_KEY }}
run: echo "Connecting with secure key..."`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Production secrets masked automatically in GitHub Actions run logs",
              "Production deployment requires designated team member approval"
            ],
            tags: ["secrets", "environments", "governance"]
          }
        ]
      },
      {
        id: "mod-7.2",
        code: "7.2",
        title: "Workflow Optimization & Matrix Builds",
        description: "Accelerate pipeline duration using actions/cache and test against multiple runtime versions.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-7.2.1",
            title: "Accelerate pipeline speeds using actions/cache for dependencies",
            description: "Implement caching for ~/.npm or ~/.cache/pip using hashFiles key to eliminate redundant downloads.",
            commandSnippet: `- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-node-`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Second pipeline run reuses cached dependencies in <5s",
              "Cache key updates automatically when package-lock.json changes"
            ],
            tags: ["cache", "optimization", "github-actions"]
          },
          {
            id: "task-7.2.2",
            title: "Execute matrix test builds across multiple language runtime versions",
            description: "Configure a build matrix spanning Node 18, 20, and 22 across Ubuntu and macOS runners.",
            commandSnippet: `strategy:
  matrix:
    os: [ubuntu-latest]
    node-version: [18.x, 20.x, 22.x]
runs-on: \${{ matrix.os }}`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Spawns parallel concurrent test jobs for all matrix permutations",
              "Guarantees backwards compatibility across supported runtimes"
            ],
            tags: ["matrix", "parallel", "testing"]
          }
        ]
      },
      {
        id: "mod-7.3",
        code: "7.3",
        title: "Container Packaging & Continuous Deployment",
        description: "Build OCI container images with Docker Buildx, scan with Trivy Action, and push to GitHub Container Registry.",
        estimatedHours: 20,
        tasks: [
          {
            id: "task-7.3.1",
            title: "Authenticate with GitHub Container Registry (GHCR) using GITHUB_TOKEN",
            description: "Log in to ghcr.io inside GitHub Actions workflow using scoped permissions.",
            commandSnippet: `- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: \${{ github.actor }}
    password: \${{ secrets.GITHUB_TOKEN }}`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Workflow authenticates without needing long-lived Personal Access Tokens",
              "Least privilege permissions (packages: write)"
            ],
            tags: ["ghcr", "registry", "docker"]
          },
          {
            id: "task-7.3.2",
            title: "Build and push multi-arch OCI images with Docker Buildx",
            description: "Build linux/amd64 and linux/arm64 multi-architecture container images and push semantic tags.",
            commandSnippet: `- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v5
  with:
    push: true
    platforms: linux/amd64,linux/arm64
    tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Published image runs natively on both x86 and ARM (AWS Graviton) architectures",
              "Docker layer cache exported to GitHub Actions cache"
            ],
            tags: ["buildx", "multi-arch", "containers"]
          },
          {
            id: "task-7.3.3",
            title: "Run automated vulnerability scanning in workflow using Trivy Action",
            description: "Integrate aquasecurity/trivy-action to block workflow if image contains HIGH or CRITICAL CVEs.",
            commandSnippet: `- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Workflow halts and blocks deployment on critical vulnerabilities",
              "SARIF report uploaded to GitHub Security code scanning tab"
            ],
            tags: ["trivy", "security", "cve"]
          },
          {
            id: "task-7.3.4",
            title: "Implement automated SSH deployment with healthcheck rollback logic",
            description: "Deploy updated container to remote production host and execute rollback if healthcheck endpoint fails.",
            commandSnippet: `deploy:
  runs-on: ubuntu-latest
  steps:
    - uses: appleboy/ssh-action@master
      with:
        host: \${{ secrets.PROD_HOST }}
        username: deployer
        key: \${{ secrets.DEPLOY_SSH_KEY }}
        script: |
          docker pull ghcr.io/org/app:\${{ github.sha }}
          docker stop app-live || true
          docker run -d --name app-next -p 8080:8080 ghcr.io/org/app:\${{ github.sha }}
          sleep 5
          if curl -f http://localhost:8080/health; then
            docker rm -f app-live || true
            docker rename app-next app-live
          else
            echo "Healthcheck failed! Rolling back..."
            docker rm -f app-next
            docker start app-live
            exit 1
          fi`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Automated deployment executes cleanly on remote server",
              "Automated rollback restored original container within 15 seconds of failure"
            ],
            tags: ["cd", "deployment", "rollback"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-6-7.1",
        title: "EC2 Secure Provisioning & Architecture Defense",
        slug: "ec2-secure-provisioning",
        description:
          "Provision an EC2 instance in a private subnet behind an Application Load Balancer (ALB). Configure Security Groups so that the EC2 instance accepts HTTP traffic ONLY from the ALB's security group, with SSH accessible solely via AWS Systems Manager (SSM) Session Manager (zero public open ports).",
        deliverables: [
          "Security group rule matrix demonstrating chained security group IDs",
          "IAM Instance Profile with AmazonSSMManagedInstanceCore policy",
          "Successful connection test via aws ssm start-session without SSH key or port 22 open"
        ],
        codeTemplate: `# Security Group Chain: EC2 allows port 80 ONLY from ALB SG
aws ec2 authorize-security-group-ingress \\
  --group-id sg-compute-instance \\
  --protocol tcp \\
  --port 80 \\
  --source-group sg-application-load-balancer`,
        language: "bash",
        verificationCommand: "aws ssm start-session --target i-0123456789abcdef0"
      },
      {
        id: "ms-6-7.2",
        title: "End-to-End Dockerized Service Deployment Pipeline",
        slug: "e2e-docker-pipeline",
        description:
          "Build a complete GitHub Actions CI/CD workflow that tests a containerized application, builds and scans the Docker image with Trivy, pushes the artifact to GHCR, and deploys the container onto a remote server via SSH/OIDC with rollback capability upon healthcheck failure.",
        deliverables: [
          ".github/workflows/deploy.yml with test, build, scan, and deploy stages",
          "Automated smoke test verifying HTTP 200 response after deployment",
          "Automatic container rollback if healthcheck endpoint fails within 30 seconds"
        ],
        codeTemplate: `# Verify workflow runs in repository
gh run list --workflow=deploy.yml`,
        language: "bash",
        verificationCommand: "gh run list --workflow=deploy.yml"
      }
    ]
  },

  // ==========================================
  // PHASE 8: 13 Tasks + 1 Milestone
  // ==========================================
  {
    id: "phase-8",
    phaseNumber: 8,
    title: "Infrastructure as Code (Terraform)",
    subtitle: "Declarative Cloud Orchestration, Remote State Locking & Modular Design",
    duration: "3 Weeks",
    mode: "Sequential",
    description:
      "Master HashiCorp Configuration Language (HCL), S3 remote state backends with DynamoDB locking, reusable custom modules, drift detection, and automated CI/CD Terraform pipelines.",
    iconName: "Cpu",
    rankBadge: "DevOps Lead",
    modules: [
      {
        id: "mod-8.1",
        code: "8.1",
        title: "Terraform Core Foundations",
        description: "Install Terraform CLI, configure providers, and master the core command lifecycle.",
        estimatedHours: 12,
        tasks: [
          {
            id: "task-8.1.1",
            title: "Install Terraform CLI and initialize provider dependencies",
            description: "Configure local environment with terraform CLI and verify binary version constraints.",
            commandSnippet: `# Check terraform version and provider plugin mirror
terraform version
terraform -install-autocomplete`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Terraform CLI installed (version >= 1.5.0)",
              "Shell tab-completion functional"
            ],
            tags: ["terraform", "cli", "setup"]
          },
          {
            id: "task-8.1.2",
            title: "Execute terraform fmt, validate, plan, and apply lifecycle workflow",
            description: "Enforce code formatting with terraform fmt -check and validate configuration syntax.",
            commandSnippet: `# Standard formatting and validation sequence
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "terraform fmt checks and standardizes all .tf files",
              "terraform validate confirms syntax and schema correctness"
            ],
            tags: ["terraform", "workflow", "fmt"]
          }
        ]
      },
      {
        id: "mod-8.2",
        code: "8.2",
        title: "HCL Syntax, Resources, Data Sources & Variables",
        description: "Declare AWS resources, input variable validations, data source lookups, and dynamic blocks.",
        estimatedHours: 20,
        tasks: [
          {
            id: "task-8.2.1",
            title: "Declare AWS provider, required_version, and required_providers blocks",
            description: "Author versions.tf specifying exact version constraints for HashiCorp AWS provider.",
            commandSnippet: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}`,
            snippetLanguage: "hcl",
            acceptanceCriteria: [
              "terraform init downloads pinned provider version without conflicts",
              ".terraform.lock.hcl generated with dependency checksums"
            ],
            tags: ["terraform", "providers", "hcl"]
          },
          {
            id: "task-8.2.2",
            title: "Declare custom VPC, subnets, and internet gateway resources",
            description: "Write main.tf declaring aws_vpc, aws_subnet, and aws_internet_gateway resources.",
            commandSnippet: `resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "\${var.environment}-vpc"
  }
}`,
            snippetLanguage: "hcl",
            acceptanceCriteria: [
              "terraform plan reflects accurate resource creation set",
              "Resource tags applied uniformly across all components"
            ],
            tags: ["terraform", "vpc", "resources"]
          },
          {
            id: "task-8.2.3",
            title: "Define input variables with type constraints, descriptions, and validations",
            description: "Author variables.tf enforcing CIDR regex checks and allowed environment string sets.",
            commandSnippet: `variable "environment" {
  type        = string
  description = "Target deployment environment"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Allowed values: dev, staging, prod."
  }
}`,
            snippetLanguage: "hcl",
            acceptanceCriteria: [
              "Invalid variable input halts terraform plan with custom error message",
              "All variables explicitly typed (string, number, list, map)"
            ],
            tags: ["terraform", "variables", "validation"]
          },
          {
            id: "task-8.2.4",
            title: "Query existing cloud infrastructure using terraform data sources",
            description: "Query latest Amazon Linux 2023 AMI dynamically using aws_ami data source filter.",
            commandSnippet: `data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}`,
            snippetLanguage: "hcl",
            acceptanceCriteria: [
              "Dynamically resolves current AMI ID without hardcoding string",
              "Updates cleanly across AWS regions"
            ],
            tags: ["terraform", "data-sources", "ami"]
          },
          {
            id: "task-8.2.5",
            title: "Expose critical resource attributes using terraform outputs",
            description: "Export VPC ID, public subnet IDs, and ALB DNS name in outputs.tf.",
            commandSnippet: `output "alb_dns_name" {
  description = "Public URL of Application Load Balancer"
  value       = aws_lb.main.dns_name
}`,
            snippetLanguage: "hcl",
            acceptanceCriteria: [
              "terraform output prints structured values to console",
              "Outputs accessible to upstream orchestration scripts via -json flag"
            ],
            tags: ["terraform", "outputs", "hcl"]
          },
          {
            id: "task-8.2.6",
            title: "Implement dynamic blocks, count, and for_each conditional expressions",
            description: "Use for_each to provision multiple subnets across Availability Zones from a map variable.",
            commandSnippet: `resource "aws_subnet" "public" {
  for_each          = var.public_subnets
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az
}`,
            snippetLanguage: "hcl",
            acceptanceCriteria: [
              "Subnets created dynamically according to map entries",
              "Removing an element removes only that specific subnet without recreating others"
            ],
            tags: ["terraform", "for-each", "dynamic-blocks"]
          }
        ]
      },
      {
        id: "mod-8.3",
        code: "8.3",
        title: "Remote State & Concurrency Locking",
        description: "Configure AWS S3 bucket with server-side encryption and DynamoDB state locking table.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-8.3.1",
            title: "Provision dedicated S3 bucket with KMS encryption for remote state storage",
            description: "Deploy remote state backend configuration and migrate local state file to S3 securely.",
            commandSnippet: `terraform {
  backend "s3" {
    bucket         = "production-terraform-state-vault"
    key            = "infrastructure/production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}`,
            snippetLanguage: "hcl",
            acceptanceCriteria: [
              "terraform init prompts for state migration to S3",
              "Remote state file encrypted with AES-256 or AWS KMS"
            ],
            tags: ["terraform", "s3", "backend"]
          },
          {
            id: "task-8.3.2",
            title: "Configure DynamoDB state locking table to eliminate concurrent apply race conditions",
            description: "Verify that simultaneous terraform apply executions acquire mutex lock and reject second attempt.",
            commandSnippet: `# Verify lock acquire in DynamoDB
aws dynamodb scan --table-name terraform-state-lock`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Simultaneous execution halts with 'Error acquiring state lock'",
              "Lock releases automatically upon apply completion"
            ],
            tags: ["terraform", "dynamodb", "locking"]
          }
        ]
      },
      {
        id: "mod-8.4",
        code: "8.4",
        title: "Modular Architecture, Workspaces & Compliance",
        description: "Structure reusable custom Terraform modules, workspaces, and scan IaC with Checkov.",
        estimatedHours: 18,
        tasks: [
          {
            id: "task-8.4.1",
            title: "Structure reusable custom Terraform modules for VPC and compute layers",
            description: "Organize modules/vpc and modules/asg with defined inputs, outputs, and README documentation.",
            commandSnippet: `module "vpc" {
  source   = "./modules/vpc"
  vpc_cidr = "10.0.0.0/16"
  env      = "production"
}`,
            snippetLanguage: "hcl",
            acceptanceCriteria: [
              "Root module cleanly calls custom encapsulated child modules",
              "Child modules have zero hardcoded environment strings"
            ],
            tags: ["terraform", "modules", "architecture"]
          },
          {
            id: "task-8.4.2",
            title: "Manage multi-environment deployments using Terraform workspaces or terragrunt",
            description: "Isolate state files across dev, staging, and prod using terraform workspace select.",
            commandSnippet: `# Switch and create workspaces
terraform workspace new staging
terraform workspace select staging
terraform plan -var-file=staging.tfvars`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "State files segregated in env:/staging/ and env:/prod/ remote S3 prefixes",
              "Zero accidental cross-environment state pollution"
            ],
            tags: ["terraform", "workspaces", "environments"]
          },
          {
            id: "task-8.4.3",
            title: "Run Checkov static code security scanning for IaC compliance",
            description: "Execute Checkov against Terraform code repository to detect open security groups or unencrypted disks.",
            commandSnippet: `# Scan Terraform directory and enforce security compliance
checkov -d . --framework terraform --output cli --soft-fail`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Checkov report lists all passed and failed security checks",
              "Zero high-severity misconfigurations in production modules"
            ],
            tags: ["checkov", "compliance", "iac"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-8",
        title: "IaC Automated Cloud Stack (Terraform)",
        slug: "iac-automated-cloud-stack",
        description:
          "Author a complete, production-ready Terraform codebase that provisions a multi-tier AWS architecture: 1 custom VPC with 2 public & 2 private subnets, NAT Gateway, Application Load Balancer, an Auto-Scaling Group of EC2 instances running Nginx in private subnets, and an RDS PostgreSQL database with encrypted storage.",
        deliverables: [
          "Root module calling custom modules: vpc, alb, asg, and rds",
          "Remote S3 backend with DynamoDB locking enabled",
          "Automated terraform plan and apply execution outputs clean HTTP 200 via ALB DNS URL"
        ],
        codeTemplate: `# Root main.tf invocation
module "vpc" {
  source   = "./modules/vpc"
  cidr     = "10.0.0.0/16"
  env      = "production"
}

module "compute_cluster" {
  source        = "./modules/asg"
  vpc_id        = module.vpc.vpc_id
  subnet_ids    = module.vpc.private_subnet_ids
  target_group  = module.alb.target_group_arn
  min_size      = 2
  max_size      = 4
}`,
        language: "hcl",
        verificationCommand: "terraform validate && terraform plan"
      }
    ]
  },

  // ==========================================
  // PHASE 9: 14 Tasks + 1 Milestone
  // ==========================================
  {
    id: "phase-9",
    phaseNumber: 9,
    title: "Container Orchestration with Kubernetes",
    subtitle: "K8s Architecture, Self-Healing Fleets, Services, Ingress & Helm",
    duration: "4 Weeks",
    mode: "Sequential",
    description:
      "Master Kubernetes control plane primitives (kube-apiserver, etcd, controller-manager, scheduler), Pod lifecycles, Deployments, Services, Ingress controllers, PersistentVolumes, and Helm templating.",
    iconName: "Boxes",
    rankBadge: "DevOps Lead",
    modules: [
      {
        id: "mod-9.1",
        code: "9.1",
        title: "K8s Control Plane Architecture & Cluster Setup",
        description: "Deconstruct etcd consensus, kubelet reconciliation loops, and bootstrap local clusters.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-9.1.1",
            title: "Deconstruct Kubernetes control plane components (API server, etcd, controller manager, scheduler)",
            description: "Analyze the responsibilities of core control plane daemons and worker kubelet / kube-proxy agents.",
            commandSnippet: `# Inspect control plane static pod manifests
ls -l /etc/kubernetes/manifests/
kubectl get componentstatuses 2>/dev/null || kubectl get --raw='/readyz'`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Understand role of API server as single source of truth for etcd",
              "Identify how controller manager reconciles current state with desired state"
            ],
            tags: ["kubernetes", "architecture", "control-plane"]
          },
          {
            id: "task-9.1.2",
            title: "Bootstrap a local multi-node Kubernetes cluster with Kind or Minikube",
            description: "Create a 3-node cluster (1 control-plane, 2 workers) using Kind with port mapping configuration.",
            commandSnippet: `# kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "kind create cluster --config kind-config.yaml succeeds",
              "kubectl get nodes shows 3 Ready nodes"
            ],
            tags: ["kind", "minikube", "cluster"]
          }
        ]
      },
      {
        id: "mod-9.2",
        code: "9.2",
        title: "Cluster Administration with Kubectl",
        description: "Manage contexts, namespaces, describe pods, and execute interactive container debugging.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-9.2.1",
            title: "Manage cluster contexts and namespaces using kubectl config",
            description: "Switch between clusters, users, and default namespaces without mutating raw kubeconfig manually.",
            commandSnippet: `# Switch active namespace
kubectl config set-context --current --namespace=production
kubectl config current-context`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "kubectl commands default to production namespace automatically",
              "Verify active cluster user credentials"
            ],
            tags: ["kubectl", "namespaces", "config"]
          },
          {
            id: "task-9.2.2",
            title: "Inspect cluster events, describe failing pods, and stream pod logs",
            description: "Diagnose CrashLoopBackOff and ImagePullBackOff states via kubectl describe pod and logs.",
            commandSnippet: `# View recent warning events across all namespaces
kubectl get events --sort-by='.metadata.creationTimestamp' -A
# Stream pod logs with timestamp
kubectl logs -f deployment/api-server --tail=50 --timestamps`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Locate exact exit codes (OOMKilled, exit code 137, 1) in describe output",
              "Stream live logs across multiple replica containers with -l app=api"
            ],
            tags: ["kubectl", "debugging", "logs"]
          },
          {
            id: "task-9.2.3",
            title: "Execute interactive debugging sessions inside pods using kubectl exec and debug",
            description: "Spawn ephemeral debug containers inside distroless pods without installing debugging tools permanently.",
            commandSnippet: `# Attach ephemeral debugging container with network tools
kubectl debug -it pod/distroless-pod --image=nicolaka/netshoot --target=api-container`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Ephemeral container shares process namespace with target pod",
              "Allows troubleshooting network and socket states in distroless environments"
            ],
            tags: ["kubectl", "debug", "troubleshooting"]
          }
        ]
      },
      {
        id: "mod-9.3",
        code: "9.3",
        title: "Manifests: Pods, Deployments, Services, Ingress, Probes & Limits",
        description: "Author complete microservice deployment topologies with rolling updates, Ingress, probes, and PVCs.",
        estimatedHours: 24,
        tasks: [
          {
            id: "task-9.3.1",
            title: "Author multi-replica Deployment with rolling update strategy",
            description: "Deploy a declarative deployment manifest with maxSurge and maxUnavailable rolling update parameters.",
            commandSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deploy
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Deploy 3 pods running in parallel",
              "Zero-downtime rolling update verified during rollout restart"
            ],
            tags: ["kubernetes", "deployment", "rolling-update"]
          },
          {
            id: "task-9.3.2",
            title: "Expose microservices internally using ClusterIP and NodePort Services",
            description: "Define Service manifest routing internal cluster traffic with label selectors to backend Pods.",
            commandSnippet: `apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  type: ClusterIP
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 80`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Service assigns virtual ClusterIP address and CoreDNS record api-service.default.svc.cluster.local",
              "Load balances requests across healthy Pod endpoints"
            ],
            tags: ["kubernetes", "service", "clusterip"]
          },
          {
            id: "task-9.3.3",
            title: "Deploy Ingress-Nginx Controller with path-based HTTP routing rules",
            description: "Deploy Ingress resource routing /api to backend service and / to frontend service.",
            commandSnippet: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: app.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Ingress controller routes traffic to appropriate backend Service",
              "Path routing preserves request headers"
            ],
            tags: ["ingress", "networking", "kubernetes"]
          },
          {
            id: "task-9.3.4",
            title: "Configure livenessProbe and readinessProbe HTTP health endpoints",
            description: "Implement liveness and readiness probes to isolate unhealthy pods from service traffic.",
            commandSnippet: `livenessProbe:
  httpGet:
    path: /healthz
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /ready
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 3`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Pods failing readiness probe removed from Service endpoints within 3 seconds",
              "Pods failing liveness probe restarted automatically by kubelet"
            ],
            tags: ["probes", "self-healing", "kubernetes"]
          },
          {
            id: "task-9.3.5",
            title: "Enforce container CPU and memory resource requests and limits",
            description: "Define resource requests and limits to establish QoS classes (Guaranteed / Burstable).",
            commandSnippet: `resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "250m"`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Scheduler places pods based on available node resource requests",
              "Containers exceeding memory limit throttled or OOM terminated safely"
            ],
            tags: ["resources", "limits", "qos"]
          },
          {
            id: "task-9.3.6",
            title: "Decouple application configuration using ConfigMaps and Secrets",
            description: "Inject environment variables and configuration files from ConfigMaps and base64-encoded Secrets.",
            commandSnippet: `envFrom:
- configMapRef:
    name: app-config
- secretRef:
    name: app-secrets`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Config values injected into container runtime without modifying container image",
              "Secrets decrypted into pod memory securely"
            ],
            tags: ["configmap", "secrets", "kubernetes"]
          },
          {
            id: "task-9.3.7",
            title: "Mount resilient persistent storage via PersistentVolumeClaims (PVC)",
            description: "Request dynamic cloud storage allocation using StorageClass and mount volume into container path.",
            commandSnippet: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "PVC automatically bound to provisioned PV via CSI driver",
              "Data persists across pod restarts and deployments"
            ],
            tags: ["pvc", "storage", "kubernetes"]
          }
        ]
      },
      {
        id: "mod-9.4",
        code: "9.4",
        title: "Package Management with Helm & Auto-Scaling",
        description: "Author modular Helm 3 charts with values.yaml templating and configure Horizontal Pod Autoscaler.",
        estimatedHours: 16,
        tasks: [
          {
            id: "task-9.4.1",
            title: "Package Kubernetes manifests into a modular Helm 3 chart with values.yaml",
            description: "Author a reusable Helm chart supporting dev, staging, and prod environment value overrides.",
            commandSnippet: `# Create chart and test template rendering
helm create my-service
helm template my-service ./my-service -f ./my-service/values-prod.yaml | kubectl apply --dry-run=client -f -`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "helm lint returns 0 errors",
              "Values file parameters successfully injected into Kubernetes templates"
            ],
            tags: ["helm", "packaging", "kubernetes"]
          },
          {
            id: "task-9.4.2",
            title: "Configure Horizontal Pod Autoscaler (HPA) to autoscale based on CPU utilization",
            description: "Deploy HPA targeting deployment to autoscale from 2 to 10 replicas when CPU exceeds 60%.",
            commandSnippet: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deploy
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "HPA reads live metrics from metrics-server",
              "Simulated load test triggers automatic scale-up of replicas"
            ],
            tags: ["hpa", "autoscaling", "kubernetes"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-9",
        title: "Self-Healing Microservice Fleet (Kubernetes)",
        slug: "self-healing-fleet",
        description:
          "Deploy an end-to-end multi-tier microservice fleet on Kubernetes: 1 Ingress controller, 1 API backend deployment with Horizontal Pod Autoscaler (HPA), 1 Redis caching cluster, ConfigMaps/Secrets for environment injection, and custom liveness/readiness probes.",
        deliverables: [
          "Complete manifest bundle or Helm chart containing Deployment, Service, Ingress, HPA, and Secret",
          "Demonstration of self-healing: killing any pod results in instant replacement (<2s)",
          "Load-testing proof showing HPA scaling pod count from 2 to 5 replicas under load"
        ],
        codeTemplate: `# Verify HPA autoscaling under load
kubectl autoscale deployment microservice-api --cpu-percent=50 --min=2 --max=5
kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while true; do wget -q -O- http://microservice-api:8080/load; done"`,
        language: "bash",
        verificationCommand: "kubectl get pods,svc,hpa -l app=microservice-api"
      }
    ]
  },

  // ==========================================
  // PHASE 10: 7 Tasks + 1 Milestone
  // ==========================================
  {
    id: "phase-10",
    phaseNumber: 10,
    title: "Full-Stack Observability & Monitoring",
    subtitle: "Prometheus Metrics, PromQL, Grafana Visuals & Loki Log Aggregation",
    duration: "3 Weeks",
    mode: "Sequential",
    description:
      "Implement the 3 pillars of observability (Metrics, Logs, Traces). Instrument workloads with Prometheus client libraries, craft PromQL queries, build Grafana dashboards, and route alerts via Alertmanager.",
    iconName: "Activity",
    rankBadge: "DevOps Lead",
    modules: [
      {
        id: "mod-10.1",
        code: "10.1",
        title: "Prometheus TSDB Architecture & Exporters",
        description: "Configure Prometheus server scrape targets and node_exporter metrics collectors.",
        estimatedHours: 12,
        tasks: [
          {
            id: "task-10.1.1",
            title: "Deploy Prometheus server and configure scrape jobs for node-exporter",
            description: "Configure prometheus.yml to scrape host node_exporter and Kubernetes pod metric endpoints.",
            commandSnippet: `# prometheus.yml scrape configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "node-telemetry"
    static_configs:
      - targets: ["node-exporter:9100"]`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Prometheus targets page shows all endpoints in state UP",
              "node_cpu_seconds_total metric querying succeeds in PromQL console"
            ],
            tags: ["prometheus", "metrics", "promql"]
          }
        ]
      },
      {
        id: "mod-10.2",
        code: "10.2",
        title: "PromQL Querying, Grafana Dashboards & Alerting",
        description: "Master PromQL rate and histogram queries, build Grafana dashboards, and route alert notifications.",
        estimatedHours: 20,
        tasks: [
          {
            id: "task-10.2.1",
            title: "Query counter rates, gauges, and calculate histogram percentiles (P95/P99)",
            description: "Calculate P95 and P99 latency response times using PromQL histogram_quantile function.",
            commandSnippet: `# P99 Request Latency calculation
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`,
            snippetLanguage: "promql",
            acceptanceCriteria: [
              "PromQL accurately reflects 99th percentile response time spikes",
              "Histogram buckets interpolate smoothly across time windows"
            ],
            tags: ["promql", "metrics", "latency"]
          },
          {
            id: "task-10.2.2",
            title: "Formulate SLI/SLO error budget PromQL queries for HTTP 5xx response ratios",
            description: "Calculate percentage ratio of 5xx server errors to total request volume over 5 minutes.",
            commandSnippet: `# 5xx Error Rate Percentage
(sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100`,
            snippetLanguage: "promql",
            acceptanceCriteria: [
              "Error rate query outputs percentage suitable for alert triggering",
              "Returns zero on clean traffic without NaN or divide-by-zero errors"
            ],
            tags: ["promql", "slo", "monitoring"]
          },
          {
            id: "task-10.2.3",
            title: "Build interactive Grafana dashboard with RED metrics (Rate, Errors, Duration)",
            description: "Create a Grafana dashboard featuring request throughput, error ratios, and latency graphs.",
            commandSnippet: `# Import Grafana Dashboard via JSON API or CLI
curl -X POST -H "Content-Type: application/json" -d @dashboard.json \\
  http://admin:admin@localhost:3000/api/dashboards/db`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Dashboard panels render real-time graphs with zero dropped data points",
              "Time range selector filters data smoothly across panels"
            ],
            tags: ["grafana", "dashboards", "red-metrics"]
          },
          {
            id: "task-10.2.4",
            title: "Configure Alertmanager notification routing rules for Slack and email",
            description: "Author alertmanager.yml defining receivers, grouping intervals, and severity routing.",
            commandSnippet: `# alertmanager.yml routing
route:
  group_by: ['alertname', 'cluster']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h
  receiver: 'slack-notifications'

receivers:
- name: 'slack-notifications'
  slack_configs:
  - channel: '#alerts-devops'
    send_resolved: true`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Failing metric triggers alert notification in target Slack channel",
              "Resolution notification sent when metric recovers to normal"
            ],
            tags: ["alertmanager", "alerts", "slack"]
          }
        ]
      },
      {
        id: "mod-10.3",
        code: "10.3",
        title: "Centralized Log Aggregation with Loki",
        description: "Deploy Grafana Loki and Promtail to stream application logs and query with LogQL.",
        estimatedHours: 14,
        tasks: [
          {
            id: "task-10.3.1",
            title: "Deploy Grafana Loki and Promtail daemonset to stream container stdout logs",
            description: "Deploy Promtail daemonset, index logs by pod and namespace labels, and ship to Loki.",
            commandSnippet: `# Promtail scrape config for container logs
scrape_configs:
- job_name: kubernetes-pods
  kubernetes_sd_configs:
  - role: pod`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Promtail reliably ships log streams to Loki backend",
              "Log stream labels (pod, namespace, container) match Prometheus labels"
            ],
            tags: ["loki", "promtail", "logging"]
          },
          {
            id: "task-10.3.2",
            title: "Query real-time structured logs in Grafana Explore using LogQL filter syntax",
            description: "Execute LogQL queries extracting JSON fields and filtering by HTTP status code >= 500.",
            commandSnippet: `# LogQL Query in Grafana Explore:
{app="microservice-api"} |= "error" | json | status >= 500`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "LogQL filters out non-error entries and extracts JSON payload fields",
              "Correlates log timestamps with Prometheus metric spikes"
            ],
            tags: ["logql", "loki", "logs"]
          }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-10",
        title: "Prometheus & Grafana Monitoring Stack",
        slug: "prometheus-grafana-stack",
        description:
          "Deploy an integrated observability stack monitoring a live microservice fleet. Configure Prometheus, Node Exporter, Grafana with pre-configured dashboards, and Alertmanager rules that trigger alerts whenever HTTP 5xx error rates exceed 2% for longer than 3 minutes.",
        deliverables: [
          "Operational docker-compose or helm chart launching Prometheus, Grafana, and Alertmanager",
          "Production-ready Grafana dashboard displaying RED metrics (Rate, Errors, Duration)",
          "Verified Alertmanager notification delivered to webhook/Slack during simulated traffic errors"
        ],
        codeTemplate: `# alertmanager-rules.yml
groups:
- name: api_service_alerts
  rules:
  - alert: HighErrorRate5xx
    expr: (sum(rate(http_requests_total{status=~"5.."}[2m])) / sum(rate(http_requests_total[2m]))) * 100 > 2
    for: 3m
    labels:
      severity: critical
    annotations:
      summary: "High 5xx error rate on API service"
      description: "Error rate is {{ $value }}% (threshold > 2%)."`,
        language: "yaml",
        verificationCommand: "curl -s http://localhost:9090/api/v1/alerts | jq ."
      }
    ]
  },

  // ==========================================
  // PHASE 11: 3 Tasks
  // ==========================================
  {
    id: "phase-11",
    phaseNumber: 11,
    title: "Production Hardening, DevSecOps & Capstone Defense",
    subtitle: "Chaos Engineering, Zero-Trust Compliance, CIS Benchmarks & Capstone Defense",
    duration: "2 Weeks",
    mode: "Sequential",
    description:
      "Execute automated chaos experiments, enforce CIS security benchmarks, rotate credentials with Vault/SOPS, establish automated incident runbooks, and defend the graduation capstone.",
    iconName: "Zap",
    rankBadge: "DevOps Lead",
    modules: [
      {
        id: "mod-11.1",
        code: "11.1",
        title: "Enterprise Hardening, Chaos Testing & Incident Response",
        description: "Manage encrypted secrets, audit CIS benchmarks, and conduct Chaos Mesh network partition experiments.",
        estimatedHours: 24,
        tasks: [
          {
            id: "task-11.1.1",
            title: "Encrypt and manage repository secrets with Mozilla SOPS and HashiCorp Vault",
            description: "Encrypt YAML secret values with age or AWS KMS keys using Mozilla SOPS before committing to Git.",
            commandSnippet: `# Encrypt secrets.enc.yaml using AWS KMS key
sops --encrypt --kms "arn:aws:kms:us-east-1:123456789012:key/my-key" secrets.yaml > secrets.enc.yaml
# Decrypt for verification
sops --decrypt secrets.enc.yaml`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "Only encrypted ciphertext is stored in version control",
              "CI/CD pipeline decrypts values seamlessly using assigned IAM role"
            ],
            tags: ["sops", "vault", "secrets"]
          },
          {
            id: "task-11.1.2",
            title: "Audit running Kubernetes cluster against CIS benchmarks using kube-bench",
            description: "Execute automated CIS benchmark scanner against master and worker node configurations.",
            commandSnippet: `# Execute kube-bench on Kubernetes cluster nodes
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl logs -f job/kube-bench`,
            snippetLanguage: "bash",
            acceptanceCriteria: [
              "kube-bench validates master and node conformance against CIS standards",
              "All high-priority failures remediated (anonymous auth disabled, file permissions locked)"
            ],
            tags: ["kube-bench", "cis-benchmarks", "security"]
          },
          {
            id: "task-11.1.3",
            title: "Inject network latency and pod failure chaos experiments using Chaos Mesh",
            description: "Inject 200ms packet latency and random packet drop into production cluster to verify graceful service degradation.",
            commandSnippet: `# Chaos Experiment YAML
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: api-latency-injection
spec:
  action: delay
  mode: one
  selector:
    namespaces: ["production"]
    labelSelectors:
      app: "microservice-api"
  delay:
    latency: "200ms"
    jitter: "20ms"
  duration: "5m"`,
            snippetLanguage: "yaml",
            acceptanceCriteria: [
              "Upstream caller circuits break gracefully without cascading cluster outage",
              "Prometheus metrics capture increased latency; system recovers immediately upon experiment end"
            ],
            tags: ["chaos-mesh", "chaos-engineering", "resilience"]
          }
        ]
      }
    ],
    milestones: []
  }
];

export const GRADUATION_CAPSTONE: CapstoneProject = {
  title: "Production Multi-Tier Cloud Delivery System",
  badge: "Graduation Capstone",
  description:
    "The definitive trial of technical competence. Design, provision, secure, observe, and automatically deliver an enterprise-grade microservice platform from zero to production without manual console interventions.",
  architectureComponents: [
    {
      layer: "1. Cloud Networking & Foundation",
      technologies: ["AWS VPC", "Subnets", "NAT Gateway", "Route 53", "VPC Flow Logs"],
      details: "Multi-AZ VPC with public and private subnets, Internet Gateway, elastic NAT gateways, and private route tables."
    },
    {
      layer: "2. Infrastructure as Code",
      technologies: ["Terraform", "S3 State Bucket", "DynamoDB Locks", "Checkov"],
      details: "100% declarative Terraform modules. Remote state stored in encrypted S3 bucket with DynamoDB concurrency locking and automated Checkov security audits."
    },
    {
      layer: "3. Compute & Container Orchestration",
      technologies: ["Amazon EKS / Hardened EC2 Fleet", "Kubernetes", "Containerd"],
      details: "Production Kubernetes cluster running non-root container workloads with auto-scaling (HPA), rolling updates, and self-healing health probes."
    },
    {
      layer: "4. Automated CI/CD Pipeline",
      technologies: ["GitHub Actions", "Docker Buildx", "Trivy", "Helm"],
      details: "Fully automated pipeline: Lint -> Unit Test -> Docker Build -> Trivy Vulnerability Scan -> GHCR Push -> Helm Chart Deploy to Kubernetes."
    },
    {
      layer: "5. Full-Stack Observability",
      technologies: ["Prometheus", "Grafana", "Loki", "Alertmanager"],
      details: "Integrated monitoring stack capturing system and application RED metrics, real-time Grafana dashboards, and Alertmanager notifications."
    },
    {
      layer: "6. Zero-Trust Security & Hardening",
      technologies: ["Mozilla SOPS / KMS", "Trivy", "kube-bench", "CIS Benchmarks"],
      details: "End-to-end encryption in transit (TLS 1.3) and at rest, sealed secrets via SOPS, least-privilege IAM roles with OIDC, and CIS hardened node baselines."
    }
  ],
  specifications: [
    "Zero plaintext credentials in repository (AWS IAM OIDC + GitHub Secrets + Kubernetes Secrets).",
    "Automated drift detection running on a nightly cron via Terraform.",
    "Container images built from minimal distroless/alpine bases with zero CRITICAL CVEs.",
    "Sub-second self-healing: automated recovery when pods or backend processes crash.",
    "Automated deployment rollbacks if healthcheck fails post-release."
  ],
  securityControls: [
    "AWS IAM least privilege with scoped ARN restrictions and condition blocks.",
    "EBS volume encryption enforced by default with KMS customer managed keys.",
    "Static application security testing (SAST) and container image scanning integrated into CI.",
    "Private EC2 and EKS worker nodes with zero public IPs and SSH accessible only via AWS Systems Manager."
  ],
  defenseCriteria: [
    "Live walkthrough of Terraform plan and apply execution.",
    "Demonstration of automated git push -> container build -> deployment pipeline in under 4 minutes.",
    "Chaos test: terminate a primary compute node and demonstrate zero user-facing downtime.",
    "Demonstrate real-time Grafana dashboard responding to synthetic traffic generator load.",
    "Security defense: demonstrate that attempting an unauthorized SSH or SQL connection fails immediately."
  ],
  sampleRepoStructure: `production-cloud-system/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint, test, security scan
│       └── cd.yml                 # Build container, push GHCR, helm deploy
├── terraform/
│   ├── environments/production/  # Backend configuration & tfvars
│   └── modules/                  # vpc, eks, security_groups, rds
├── kubernetes/
│   └── helm/
│       └── charts/app/           # Helm templates, values-prod.yaml
├── monitoring/
│   ├── prometheus-rules.yaml     # 5xx error alerts & latency thresholds
│   └── dashboards/               # Grafana dashboard JSON models
└── src/
    ├── Dockerfile                # Multi-stage lean OCI container
    └── app/                      # Application microservice source`,
  runbookSteps: [
    "Step 1: Check high-severity alerts in Alertmanager and identify firing rule.",
    "Step 2: Inspect real-time P99 latency and 5xx error rate panels in Grafana dashboard.",
    "Step 3: Query recent container stdout logs via Grafana Loki with LogQL status >= 500 filter.",
    "Step 4: Execute kubectl describe pod and kubectl logs to pinpoint container exit code.",
    "Step 5: If deployment regression is identified, trigger automated rollback to previous Helm release revision."
  ]
};
