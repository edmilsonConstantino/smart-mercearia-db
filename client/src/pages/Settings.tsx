import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserPlus, Lock, Activity, History, Search, Eye, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, auditLogsApi, salesApi, productsApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: usersApi.getAll
  });

  const { data: auditLogs = [], isLoading: auditLogsLoading } = useQuery({
    queryKey: ['/api/audit-logs'],
    queryFn: auditLogsApi.getAll
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales'],
    queryFn: salesApi.getAll
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: productsApi.getAll
  });

  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    password: '',
    role: 'seller' as 'admin' | 'manager' | 'seller'
  });

  const createUserMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAddUserOpen(false);
      setNewUser({ username: '', name: '', password: '', role: 'seller' });
      toast({ title: "Sucesso", description: "Usuário criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const [permissions, setPermissions] = useState({
    admin: { canEditProducts: true, canViewReports: true, canManageUsers: true, canSell: true, canDiscount: true },
    manager: { canEditProducts: true, canViewReports: true, canManageUsers: false, canSell: true, canDiscount: true },
    seller: { canEditProducts: false, canViewReports: false, canManageUsers: false, canSell: true, canDiscount: false },
  });

  const handlePermissionChange = (role: 'admin' | 'manager' | 'seller', key: string, value: boolean) => {
    setPermissions({
      ...permissions,
      [role]: { ...permissions[role as keyof typeof permissions], [key]: value }
    });
  };

  const filteredAuditLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchHistory.toLowerCase()) ||
    log.userId.toLowerCase().includes(searchHistory.toLowerCase()) ||
    (log.entityId && log.entityId.toLowerCase().includes(searchHistory.toLowerCase()))
  );

  const handleSaveUser = () => {
    if (!newUser.username || !newUser.name || !newUser.password) {
      toast({ 
        title: "Erro", 
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (user?.role !== 'admin') {
      toast({ 
        title: "Acesso negado", 
        description: "Apenas administradores podem criar usuários",
        variant: "destructive"
      });
      return;
    }

    createUserMutation.mutate({
      username: newUser.username,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role
    });
  };

  const isLoading = usersLoading || auditLogsLoading || salesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Administração</h1>
          <p className="text-muted-foreground">Gerenciamento de usuários, permissões e auditoria.</p>
        </div>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2" data-testid="tab-users"><UserPlus className="h-4 w-4" /> Usuários</TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2" data-testid="tab-permissions"><Shield className="h-4 w-4" /> Permissões</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2" data-testid="tab-audit"><History className="h-4 w-4" /> Rastreio & Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
             <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20" disabled={user?.role !== 'admin'} data-testid="button-add-user">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Usuário</DialogTitle>
                  <DialogDescription>Crie um novo perfil de acesso ao sistema.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nome Completo</Label>
                    <Input 
                      placeholder="Ex: João Silva" 
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      data-testid="input-user-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Nome de Usuário</Label>
                    <Input 
                      placeholder="Ex: joao.silva" 
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      data-testid="input-username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Senha</Label>
                    <Input 
                      type="password" 
                      placeholder="Senha inicial" 
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      data-testid="input-password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Função (Grupo)</Label>
                    <Select value={newUser.role} onValueChange={(val: any) => setNewUser({...newUser, role: val})}>
                      <SelectTrigger data-testid="select-user-role">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gestor</SelectItem>
                        <SelectItem value="seller">Vendedor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveUser} disabled={createUserMutation.isPending} data-testid="button-save-user">
                    {createUserMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                      <TableCell className="font-medium flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-bold">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {u.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {u.role === 'manager' ? 'Gestor' : u.role === 'seller' ? 'Vendedor' : 'Admin'}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><Lock className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Acesso por Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permissão</TableHead>
                    <TableHead className="text-center">Administrador</TableHead>
                    <TableHead className="text-center">Gestor</TableHead>
                    <TableHead className="text-center">Vendedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Editar Produtos</TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.admin.canEditProducts} onCheckedChange={(c) => handlePermissionChange('admin', 'canEditProducts', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.manager.canEditProducts} onCheckedChange={(c) => handlePermissionChange('manager', 'canEditProducts', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.seller.canEditProducts} onCheckedChange={(c) => handlePermissionChange('seller', 'canEditProducts', !!c)} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ver Relatórios Financeiros</TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.admin.canViewReports} onCheckedChange={(c) => handlePermissionChange('admin', 'canViewReports', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.manager.canViewReports} onCheckedChange={(c) => handlePermissionChange('manager', 'canViewReports', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.seller.canViewReports} onCheckedChange={(c) => handlePermissionChange('seller', 'canViewReports', !!c)} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Gerenciar Usuários</TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.admin.canManageUsers} onCheckedChange={(c) => handlePermissionChange('admin', 'canManageUsers', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.manager.canManageUsers} onCheckedChange={(c) => handlePermissionChange('manager', 'canManageUsers', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.seller.canManageUsers} onCheckedChange={(c) => handlePermissionChange('seller', 'canManageUsers', !!c)} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Aplicar Descontos no PDV</TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.admin.canDiscount} onCheckedChange={(c) => handlePermissionChange('admin', 'canDiscount', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.manager.canDiscount} onCheckedChange={(c) => handlePermissionChange('manager', 'canDiscount', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.seller.canDiscount} onCheckedChange={(c) => handlePermissionChange('seller', 'canDiscount', !!c)} /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar ação, usuário ou entidade..." 
                className="pl-9" 
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                data-testid="input-search-audit"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rastreio Completo de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log) => {
                    const logUser = users.find(u => u.id === log.userId);
                    return (
                      <TableRow key={log.id} data-testid={`row-audit-${log.id}`}>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">{logUser?.name || 'Sistema'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono">{log.entityType}</span>
                          {log.entityId && (
                            <span className="text-xs text-muted-foreground ml-1">#{log.entityId.slice(-6)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground max-w-md truncate">
                            {log.details ? JSON.stringify(log.details) : '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
